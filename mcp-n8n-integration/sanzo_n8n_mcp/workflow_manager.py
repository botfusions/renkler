"""
Workflow Manager for orchestrating N8N workflows and automation
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Set
from collections import defaultdict, deque

from .models import (
    WorkflowType,
    WorkflowStatus,
    WorkflowExecution,
    WorkflowMetrics,
    WorkflowTriggerConfig,
    BatchWorkflowRequest,
    BatchWorkflowResult,
    TriggerType
)
from .n8n_client import N8NClient


class WorkflowQueue:
    """Simple in-memory workflow queue"""

    def __init__(self, max_size: int = 1000):
        self.queue = deque(maxlen=max_size)
        self.running_workflows: Set[str] = set()
        self.completed_workflows: Dict[str, WorkflowExecution] = {}
        self.max_concurrent = 5

    def add_workflow(self, execution: WorkflowExecution) -> bool:
        """Add workflow to queue"""
        if len(self.queue) >= self.queue.maxlen:
            return False
        self.queue.append(execution)
        return True

    def get_next_workflow(self) -> Optional[WorkflowExecution]:
        """Get next workflow to execute"""
        if len(self.running_workflows) >= self.max_concurrent:
            return None
        if not self.queue:
            return None
        return self.queue.popleft()

    def mark_running(self, execution_id: str):
        """Mark workflow as running"""
        self.running_workflows.add(execution_id)

    def mark_completed(self, execution: WorkflowExecution):
        """Mark workflow as completed"""
        self.running_workflows.discard(execution.execution_id)
        self.completed_workflows[execution.execution_id] = execution

    def get_queue_size(self) -> int:
        """Get current queue size"""
        return len(self.queue)

    def get_running_count(self) -> int:
        """Get count of running workflows"""
        return len(self.running_workflows)


class WorkflowManager:
    """
    High-level workflow orchestration and management
    """

    def __init__(self, n8n_client: N8NClient):
        self.n8n_client = n8n_client
        self.queue = WorkflowQueue()
        self.metrics_store: Dict[WorkflowType, List[WorkflowExecution]] = defaultdict(list)
        self.trigger_configs: Dict[str, WorkflowTriggerConfig] = {}
        self.automation_tasks: Set[asyncio.Task] = set()
        self._running = False

    async def start(self):
        """Start the workflow manager and background tasks"""
        if self._running:
            return

        self._running = True

        # Start background task for processing workflow queue
        task = asyncio.create_task(self._process_workflow_queue())
        self.automation_tasks.add(task)
        task.add_done_callback(self.automation_tasks.discard)

        # Start background task for automated triggers
        task = asyncio.create_task(self._process_automated_triggers())
        self.automation_tasks.add(task)
        task.add_done_callback(self.automation_tasks.discard)

    async def stop(self):
        """Stop the workflow manager and background tasks"""
        self._running = False

        # Cancel all background tasks
        for task in self.automation_tasks:
            task.cancel()

        # Wait for tasks to complete
        if self.automation_tasks:
            await asyncio.gather(*self.automation_tasks, return_exceptions=True)

    async def execute_workflow(
        self,
        workflow_type: WorkflowType,
        data: Dict[str, Any],
        priority: int = 5,
        correlation_id: Optional[str] = None,
        timeout_override: Optional[int] = None
    ) -> WorkflowExecution:
        """
        Execute a single workflow with proper queuing and tracking
        """
        execution_id = f"{workflow_type.value}_{uuid.uuid4().hex[:8]}"

        # Create execution record
        execution = WorkflowExecution(
            execution_id=execution_id,
            workflow_type=workflow_type,
            status=WorkflowStatus.PENDING,
            input_data=data,
            started_at=datetime.now(),
            correlation_id=correlation_id
        )

        # Add to queue for processing
        if not self.queue.add_workflow(execution):
            execution.status = WorkflowStatus.FAILED
            execution.error_message = "Workflow queue is full"
            execution.completed_at = datetime.now()
            return execution

        # Wait for execution to complete (with timeout)
        timeout = timeout_override or 300  # 5 minutes default
        start_time = datetime.now()

        while (datetime.now() - start_time).total_seconds() < timeout:
            # Check if workflow completed
            if execution.execution_id in self.queue.completed_workflows:
                completed_execution = self.queue.completed_workflows[execution.execution_id]
                self._update_metrics(completed_execution)
                return completed_execution

            # Check if workflow is still running
            if execution.execution_id in self.queue.running_workflows:
                await asyncio.sleep(1)
                continue

            # Check if workflow is still in queue
            if execution in self.queue.queue:
                await asyncio.sleep(0.5)
                continue

            # If we get here, something went wrong
            break

        # Timeout occurred
        execution.status = WorkflowStatus.TIMEOUT
        execution.error_message = f"Workflow timed out after {timeout} seconds"
        execution.completed_at = datetime.now()
        self._update_metrics(execution)
        return execution

    async def execute_batch_workflows(
        self,
        batch_request: BatchWorkflowRequest
    ) -> BatchWorkflowResult:
        """
        Execute multiple workflows as a batch operation
        """
        batch_id = batch_request.correlation_id or f"batch_{uuid.uuid4().hex[:8]}"
        start_time = datetime.now()

        # Prepare execution tasks
        execution_tasks = []
        for i, workflow_type in enumerate(batch_request.workflows):
            # Combine shared and individual data
            workflow_data = {**batch_request.shared_data}
            if workflow_type in batch_request.individual_data:
                workflow_data.update(batch_request.individual_data[workflow_type])

            # Add batch metadata
            workflow_data.update({
                "batchId": batch_id,
                "batchIndex": i,
                "batchTotal": len(batch_request.workflows)
            })

            # Create execution task
            if batch_request.delay_between_workflows > 0 and i > 0:
                # Add delay before this workflow
                await asyncio.sleep(batch_request.delay_between_workflows / 1000)

            task = self.execute_workflow(
                workflow_type=workflow_type,
                data=workflow_data,
                correlation_id=batch_id
            )
            execution_tasks.append(task)

            # If fail_fast is enabled and we had a failure, stop creating more tasks
            if batch_request.fail_fast and execution_tasks:
                previous_result = await execution_tasks[-1]
                if previous_result.status == WorkflowStatus.FAILED:
                    break

        # Execute all workflow tasks
        if batch_request.fail_fast:
            # Execute one by one, stopping on first failure
            results = []
            for task in execution_tasks:
                result = await task
                results.append(result)
                if result.status == WorkflowStatus.FAILED:
                    break
        else:
            # Execute all in parallel
            results = await asyncio.gather(*execution_tasks, return_exceptions=True)

        # Process results
        execution_results = []
        successful_count = 0
        failed_count = 0

        for result in results:
            if isinstance(result, WorkflowExecution):
                execution_results.append(result)
                if result.status == WorkflowStatus.COMPLETED:
                    successful_count += 1
                elif result.status in [WorkflowStatus.FAILED, WorkflowStatus.TIMEOUT]:
                    failed_count += 1
            else:
                # Handle exceptions
                failed_count += 1

        completion_time = datetime.now()

        return BatchWorkflowResult(
            batch_id=batch_id,
            total_workflows=len(batch_request.workflows),
            successful_workflows=successful_count,
            failed_workflows=failed_count,
            execution_results=execution_results,
            started_at=start_time,
            completed_at=completion_time,
            total_duration_seconds=(completion_time - start_time).total_seconds()
        )

    async def get_workflow_metrics(self, workflow_type: WorkflowType) -> WorkflowMetrics:
        """
        Get comprehensive metrics for a workflow type
        """
        executions = self.metrics_store.get(workflow_type, [])

        if not executions:
            return WorkflowMetrics(
                workflow_type=workflow_type,
                total_executions=0,
                successful_executions=0,
                failed_executions=0,
                average_duration_seconds=0.0,
                success_rate=0.0,
                last_execution=None
            )

        total = len(executions)
        successful = len([e for e in executions if e.status == WorkflowStatus.COMPLETED])
        failed = len([e for e in executions if e.status == WorkflowStatus.FAILED])

        # Calculate average duration for completed workflows
        durations = [
            e.duration_seconds for e in executions
            if e.duration_seconds and e.status == WorkflowStatus.COMPLETED
        ]
        avg_duration = sum(durations) / len(durations) if durations else 0.0

        # Get last execution time
        last_execution = max(executions, key=lambda e: e.started_at).started_at if executions else None

        return WorkflowMetrics(
            workflow_type=workflow_type,
            total_executions=total,
            successful_executions=successful,
            failed_executions=failed,
            average_duration_seconds=avg_duration,
            success_rate=(successful / total * 100) if total > 0 else 0.0,
            last_execution=last_execution
        )

    async def add_automated_trigger(self, trigger_config: WorkflowTriggerConfig):
        """
        Add an automated workflow trigger configuration
        """
        self.trigger_configs[trigger_config.trigger_name] = trigger_config

    async def remove_automated_trigger(self, trigger_name: str) -> bool:
        """
        Remove an automated workflow trigger
        """
        return self.trigger_configs.pop(trigger_name, None) is not None

    async def list_automated_triggers(self) -> List[WorkflowTriggerConfig]:
        """
        List all configured automated triggers
        """
        return list(self.trigger_configs.values())

    async def get_queue_status(self) -> Dict[str, Any]:
        """
        Get current queue status and statistics
        """
        return {
            "queue_size": self.queue.get_queue_size(),
            "running_workflows": self.queue.get_running_count(),
            "completed_workflows": len(self.queue.completed_workflows),
            "max_concurrent": self.queue.max_concurrent,
            "queue_capacity": self.queue.queue.maxlen
        }

    async def cleanup_old_executions(self, retention_days: int = 7):
        """
        Clean up old execution records to prevent memory bloat
        """
        cutoff_date = datetime.now() - timedelta(days=retention_days)

        # Clean metrics store
        for workflow_type in self.metrics_store:
            self.metrics_store[workflow_type] = [
                execution for execution in self.metrics_store[workflow_type]
                if execution.started_at > cutoff_date
            ]

        # Clean completed workflows
        to_remove = [
            execution_id for execution_id, execution in self.queue.completed_workflows.items()
            if execution.started_at < cutoff_date
        ]
        for execution_id in to_remove:
            del self.queue.completed_workflows[execution_id]

    # Private methods
    async def _process_workflow_queue(self):
        """Background task to process the workflow queue"""
        while self._running:
            try:
                # Get next workflow from queue
                workflow = self.queue.get_next_workflow()
                if not workflow:
                    await asyncio.sleep(1)
                    continue

                # Mark as running
                self.queue.mark_running(workflow.execution_id)

                # Execute workflow
                try:
                    result = await self.n8n_client.trigger_workflow(
                        workflow_type=workflow.workflow_type,
                        data=workflow.input_data,
                        correlation_id=workflow.correlation_id
                    )

                    # Update the workflow execution with results
                    workflow.status = result.status
                    workflow.output_data = result.output_data
                    workflow.error_message = result.error_message
                    workflow.completed_at = result.completed_at
                    workflow.duration_seconds = result.duration_seconds
                    workflow.n8n_execution_id = result.n8n_execution_id

                except Exception as e:
                    workflow.status = WorkflowStatus.FAILED
                    workflow.error_message = f"Execution failed: {str(e)}"
                    workflow.completed_at = datetime.now()
                    workflow.duration_seconds = (
                        workflow.completed_at - workflow.started_at
                    ).total_seconds()

                # Mark as completed
                self.queue.mark_completed(workflow)

            except Exception as e:
                print(f"Error in workflow queue processor: {e}")
                await asyncio.sleep(5)

    async def _process_automated_triggers(self):
        """Background task to process automated triggers"""
        while self._running:
            try:
                current_time = datetime.now()

                # Process each trigger configuration
                for trigger_config in self.trigger_configs.values():
                    if not trigger_config.enabled:
                        continue

                    # Check if trigger conditions are met
                    # This would be expanded based on specific trigger logic
                    if await self._should_trigger_workflow(trigger_config, current_time):
                        await self.execute_workflow(
                            workflow_type=trigger_config.workflow_type,
                            data=trigger_config.data_template,
                            correlation_id=f"auto_{trigger_config.trigger_name}_{int(current_time.timestamp())}"
                        )

                await asyncio.sleep(60)  # Check triggers every minute

            except Exception as e:
                print(f"Error in automated trigger processor: {e}")
                await asyncio.sleep(60)

    async def _should_trigger_workflow(
        self,
        trigger_config: WorkflowTriggerConfig,
        current_time: datetime
    ) -> bool:
        """
        Determine if a workflow should be triggered based on its configuration
        """
        # This is a simplified implementation
        # In practice, this would evaluate complex trigger conditions

        # Check rate limiting
        recent_executions = [
            execution for execution in self.metrics_store.get(trigger_config.workflow_type, [])
            if execution.started_at > current_time - timedelta(hours=1)
        ]

        if len(recent_executions) >= trigger_config.max_executions_per_hour:
            return False

        # Add more trigger condition logic here
        # For example, checking external APIs, file changes, etc.

        return False  # Default to not triggering

    def _update_metrics(self, execution: WorkflowExecution):
        """Update metrics store with execution data"""
        self.metrics_store[execution.workflow_type].append(execution)

        # Keep only recent executions to prevent memory bloat
        max_executions_per_type = 1000
        if len(self.metrics_store[execution.workflow_type]) > max_executions_per_type:
            # Remove oldest executions
            self.metrics_store[execution.workflow_type] = sorted(
                self.metrics_store[execution.workflow_type],
                key=lambda e: e.started_at,
                reverse=True
            )[:max_executions_per_type]
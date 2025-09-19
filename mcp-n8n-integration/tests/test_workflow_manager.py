"""
Tests for Workflow Manager functionality
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from sanzo_n8n_mcp.workflow_manager import WorkflowManager, WorkflowQueue
from sanzo_n8n_mcp.models import (
    WorkflowType,
    WorkflowStatus,
    WorkflowExecution,
    BatchWorkflowRequest,
    WorkflowTriggerConfig,
    TriggerType
)


class TestWorkflowQueue:
    """Test suite for WorkflowQueue"""

    def test_queue_initialization(self):
        """Test queue initialization"""
        queue = WorkflowQueue(max_size=100)
        assert queue.queue.maxlen == 100
        assert queue.max_concurrent == 5
        assert len(queue.running_workflows) == 0
        assert len(queue.completed_workflows) == 0

    def test_add_workflow_success(self):
        """Test adding workflow to queue"""
        queue = WorkflowQueue()
        execution = MagicMock()

        result = queue.add_workflow(execution)

        assert result is True
        assert len(queue.queue) == 1
        assert queue.queue[0] == execution

    def test_add_workflow_queue_full(self):
        """Test adding workflow when queue is full"""
        queue = WorkflowQueue(max_size=1)

        # Fill the queue
        execution1 = MagicMock()
        queue.add_workflow(execution1)

        # Try to add another
        execution2 = MagicMock()
        result = queue.add_workflow(execution2)

        assert result is False
        assert len(queue.queue) == 1

    def test_get_next_workflow_available(self):
        """Test getting next workflow when available"""
        queue = WorkflowQueue()
        execution = MagicMock()
        queue.add_workflow(execution)

        next_workflow = queue.get_next_workflow()

        assert next_workflow == execution
        assert len(queue.queue) == 0

    def test_get_next_workflow_max_concurrent(self):
        """Test getting next workflow when max concurrent reached"""
        queue = WorkflowQueue()
        queue.max_concurrent = 1

        # Add a running workflow
        queue.mark_running("test_id")

        # Add workflow to queue
        execution = MagicMock()
        queue.add_workflow(execution)

        # Should not return workflow due to max concurrent
        next_workflow = queue.get_next_workflow()
        assert next_workflow is None

    def test_mark_running_and_completed(self):
        """Test marking workflows as running and completed"""
        queue = WorkflowQueue()
        execution = MagicMock()
        execution.execution_id = "test_id"

        # Mark as running
        queue.mark_running("test_id")
        assert "test_id" in queue.running_workflows

        # Mark as completed
        queue.mark_completed(execution)
        assert "test_id" not in queue.running_workflows
        assert queue.completed_workflows["test_id"] == execution


class TestWorkflowManager:
    """Test suite for WorkflowManager"""

    @pytest.fixture
    async def workflow_manager(self, mock_n8n_client):
        """Create workflow manager for testing"""
        manager = WorkflowManager(mock_n8n_client)
        await manager.start()
        yield manager
        await manager.stop()

    @pytest.mark.asyncio
    async def test_manager_start_stop(self, mock_n8n_client):
        """Test workflow manager start and stop"""
        manager = WorkflowManager(mock_n8n_client)

        # Should not be running initially
        assert not manager._running

        # Start manager
        await manager.start()
        assert manager._running
        assert len(manager.automation_tasks) > 0

        # Stop manager
        await manager.stop()
        assert not manager._running

    @pytest.mark.asyncio
    async def test_execute_workflow_success(self, workflow_manager, mock_n8n_client):
        """Test successful workflow execution"""
        # Mock successful N8N execution
        mock_execution = WorkflowExecution(
            execution_id="test_123",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            input_data={"test": "data"},
            started_at=datetime.now(),
            completed_at=datetime.now(),
            duration_seconds=1.0
        )
        mock_n8n_client.trigger_workflow.return_value = mock_execution

        # Execute workflow
        result = await workflow_manager.execute_workflow(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            data={"analysisType": "photo"},
            correlation_id="test_correlation"
        )

        # Assertions
        assert result.workflow_type == WorkflowType.CUSTOMER_ANALYSIS
        assert result.correlation_id == "test_correlation"
        assert result.input_data["analysisType"] == "photo"

    @pytest.mark.asyncio
    async def test_execute_workflow_queue_full(self, workflow_manager):
        """Test workflow execution when queue is full"""
        # Fill the queue by setting maxlen to 0
        workflow_manager.queue.queue.maxlen = 0

        result = await workflow_manager.execute_workflow(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            data={"test": "data"}
        )

        assert result.status == WorkflowStatus.FAILED
        assert "queue is full" in result.error_message

    @pytest.mark.asyncio
    async def test_execute_batch_workflows(self, workflow_manager, mock_n8n_client):
        """Test batch workflow execution"""
        # Mock successful executions
        mock_execution = MagicMock()
        mock_execution.status = WorkflowStatus.COMPLETED

        with patch.object(workflow_manager, 'execute_workflow', return_value=mock_execution) as mock_execute:
            batch_request = BatchWorkflowRequest(
                workflows=[
                    WorkflowType.CUSTOMER_ANALYSIS,
                    WorkflowType.CRM_LEAD_MANAGEMENT
                ],
                shared_data={"source": "batch"},
                individual_data={
                    WorkflowType.CUSTOMER_ANALYSIS: {"analysisType": "photo"}
                },
                correlation_id="batch_test"
            )

            result = await workflow_manager.execute_batch_workflows(batch_request)

            # Assertions
            assert result.batch_id == "batch_test"
            assert result.total_workflows == 2
            assert result.successful_workflows == 2
            assert result.failed_workflows == 0
            assert len(result.execution_results) == 2
            assert mock_execute.call_count == 2

    @pytest.mark.asyncio
    async def test_execute_batch_workflows_fail_fast(self, workflow_manager):
        """Test batch workflow execution with fail_fast enabled"""
        # Mock first execution failing
        failed_execution = MagicMock()
        failed_execution.status = WorkflowStatus.FAILED

        with patch.object(workflow_manager, 'execute_workflow', return_value=failed_execution) as mock_execute:
            batch_request = BatchWorkflowRequest(
                workflows=[
                    WorkflowType.CUSTOMER_ANALYSIS,
                    WorkflowType.CRM_LEAD_MANAGEMENT
                ],
                shared_data={"source": "batch"},
                fail_fast=True
            )

            result = await workflow_manager.execute_batch_workflows(batch_request)

            # Should only execute first workflow due to fail_fast
            assert mock_execute.call_count == 1
            assert result.failed_workflows == 1
            assert result.successful_workflows == 0

    @pytest.mark.asyncio
    async def test_get_workflow_metrics_no_data(self, workflow_manager):
        """Test getting metrics when no executions exist"""
        metrics = await workflow_manager.get_workflow_metrics(WorkflowType.CUSTOMER_ANALYSIS)

        assert metrics.workflow_type == WorkflowType.CUSTOMER_ANALYSIS
        assert metrics.total_executions == 0
        assert metrics.successful_executions == 0
        assert metrics.failed_executions == 0
        assert metrics.average_duration_seconds == 0.0
        assert metrics.success_rate == 0.0
        assert metrics.last_execution is None

    @pytest.mark.asyncio
    async def test_get_workflow_metrics_with_data(self, workflow_manager):
        """Test getting metrics with execution data"""
        # Add mock execution data
        mock_executions = [
            MagicMock(
                status=WorkflowStatus.COMPLETED,
                duration_seconds=1.0,
                started_at=datetime.now()
            ),
            MagicMock(
                status=WorkflowStatus.COMPLETED,
                duration_seconds=2.0,
                started_at=datetime.now()
            ),
            MagicMock(
                status=WorkflowStatus.FAILED,
                duration_seconds=None,
                started_at=datetime.now()
            )
        ]
        workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS] = mock_executions

        metrics = await workflow_manager.get_workflow_metrics(WorkflowType.CUSTOMER_ANALYSIS)

        assert metrics.total_executions == 3
        assert metrics.successful_executions == 2
        assert metrics.failed_executions == 1
        assert metrics.average_duration_seconds == 1.5
        assert metrics.success_rate == pytest.approx(66.67, rel=1e-2)
        assert metrics.last_execution is not None

    @pytest.mark.asyncio
    async def test_add_automated_trigger(self, workflow_manager):
        """Test adding automated trigger configuration"""
        trigger_config = WorkflowTriggerConfig(
            trigger_name="test_trigger",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            trigger_conditions={"condition": "value"},
            enabled=True,
            max_executions_per_hour=10
        )

        await workflow_manager.add_automated_trigger(trigger_config)

        assert "test_trigger" in workflow_manager.trigger_configs
        assert workflow_manager.trigger_configs["test_trigger"] == trigger_config

    @pytest.mark.asyncio
    async def test_remove_automated_trigger(self, workflow_manager):
        """Test removing automated trigger"""
        # Add trigger first
        trigger_config = WorkflowTriggerConfig(
            trigger_name="test_trigger",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            trigger_conditions={}
        )
        await workflow_manager.add_automated_trigger(trigger_config)

        # Remove trigger
        result = await workflow_manager.remove_automated_trigger("test_trigger")

        assert result is True
        assert "test_trigger" not in workflow_manager.trigger_configs

        # Try to remove non-existent trigger
        result = await workflow_manager.remove_automated_trigger("non_existent")
        assert result is False

    @pytest.mark.asyncio
    async def test_list_automated_triggers(self, workflow_manager):
        """Test listing automated triggers"""
        # Initially empty
        triggers = await workflow_manager.list_automated_triggers()
        assert len(triggers) == 0

        # Add some triggers
        trigger1 = WorkflowTriggerConfig(
            trigger_name="trigger1",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            trigger_conditions={}
        )
        trigger2 = WorkflowTriggerConfig(
            trigger_name="trigger2",
            workflow_type=WorkflowType.CRM_LEAD_MANAGEMENT,
            trigger_conditions={}
        )

        await workflow_manager.add_automated_trigger(trigger1)
        await workflow_manager.add_automated_trigger(trigger2)

        triggers = await workflow_manager.list_automated_triggers()
        assert len(triggers) == 2
        assert trigger1 in triggers
        assert trigger2 in triggers

    @pytest.mark.asyncio
    async def test_get_queue_status(self, workflow_manager):
        """Test getting queue status"""
        # Add some mock data
        workflow_manager.queue.queue.append(MagicMock())
        workflow_manager.queue.running_workflows.add("test_id")
        workflow_manager.queue.completed_workflows["completed_id"] = MagicMock()

        status = await workflow_manager.get_queue_status()

        assert status["queue_size"] == 1
        assert status["running_workflows"] == 1
        assert status["completed_workflows"] == 1
        assert status["max_concurrent"] == 5

    @pytest.mark.asyncio
    async def test_cleanup_old_executions(self, workflow_manager):
        """Test cleanup of old execution records"""
        from datetime import timedelta

        # Add old and new executions
        old_execution = MagicMock()
        old_execution.started_at = datetime.now() - timedelta(days=10)

        new_execution = MagicMock()
        new_execution.started_at = datetime.now()

        workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS] = [
            old_execution, new_execution
        ]
        workflow_manager.queue.completed_workflows["old_id"] = old_execution
        workflow_manager.queue.completed_workflows["new_id"] = new_execution

        # Cleanup with 7-day retention
        await workflow_manager.cleanup_old_executions(retention_days=7)

        # Only new execution should remain
        assert len(workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS]) == 1
        assert workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS][0] == new_execution
        assert "old_id" not in workflow_manager.queue.completed_workflows
        assert "new_id" in workflow_manager.queue.completed_workflows

    @pytest.mark.asyncio
    async def test_should_trigger_workflow_rate_limiting(self, workflow_manager):
        """Test automated trigger rate limiting"""
        from datetime import timedelta

        trigger_config = WorkflowTriggerConfig(
            trigger_name="rate_limited_trigger",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            trigger_conditions={},
            max_executions_per_hour=2
        )

        # Add recent executions that exceed rate limit
        recent_time = datetime.now() - timedelta(minutes=30)
        workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS] = [
            MagicMock(started_at=recent_time),
            MagicMock(started_at=recent_time),
            MagicMock(started_at=recent_time)  # 3 executions, limit is 2
        ]

        # Should not trigger due to rate limiting
        should_trigger = await workflow_manager._should_trigger_workflow(
            trigger_config, datetime.now()
        )

        assert should_trigger is False

    @pytest.mark.asyncio
    async def test_update_metrics(self, workflow_manager):
        """Test metrics update functionality"""
        execution = WorkflowExecution(
            execution_id="test_123",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            input_data={},
            started_at=datetime.now()
        )

        # Initially no metrics
        assert len(workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS]) == 0

        # Update metrics
        workflow_manager._update_metrics(execution)

        # Should have one execution
        assert len(workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS]) == 1
        assert workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS][0] == execution

    @pytest.mark.asyncio
    async def test_update_metrics_pruning(self, workflow_manager):
        """Test metrics pruning when exceeding max executions"""
        # Create many executions
        executions = []
        for i in range(1005):  # Exceed the 1000 limit
            execution = MagicMock()
            execution.started_at = datetime.now()
            executions.append(execution)

        # Add all executions
        for execution in executions:
            workflow_manager._update_metrics(execution)

        # Should be pruned to 1000
        stored_executions = workflow_manager.metrics_store[WorkflowType.CUSTOMER_ANALYSIS]
        assert len(stored_executions) == 1000

        # Should keep the most recent ones
        stored_times = [e.started_at for e in stored_executions]
        original_times = [e.started_at for e in executions]

        # The stored times should be from the most recent executions
        assert max(stored_times) == max(original_times)
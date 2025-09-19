"""
N8N API Client for workflow management and execution
"""

import asyncio
import json
import time
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin

import httpx
from pydantic import BaseModel

from .models import (
    WorkflowConfiguration,
    WorkflowExecution,
    WorkflowStatus,
    WorkflowType,
    WorkflowHealthCheck
)


class N8NAPIError(Exception):
    """N8N API specific errors"""
    pass


class N8NConnectionError(Exception):
    """N8N connection errors"""
    pass


class N8NClient:
    """
    Client for interacting with N8N API and webhook endpoints
    """

    def __init__(
        self,
        n8n_base_url: str = "http://localhost:5678",
        webhook_base_url: str = "http://localhost:5678/webhook",
        webhook_server_url: str = "http://localhost:3003",
        api_key: Optional[str] = None,
        timeout: int = 30
    ):
        self.n8n_base_url = n8n_base_url.rstrip('/')
        self.webhook_base_url = webhook_base_url.rstrip('/')
        self.webhook_server_url = webhook_server_url.rstrip('/')
        self.api_key = api_key
        self.timeout = timeout

        # HTTP client configuration
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        self.client = httpx.AsyncClient(
            timeout=timeout,
            headers=headers,
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )

        # Workflow configurations
        self.workflow_configs = {
            WorkflowType.CUSTOMER_ANALYSIS: WorkflowConfiguration(
                name="Customer Analysis & Email Workflow",
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                webhook_url=f"{webhook_base_url}/customer-analysis-trigger",
                description="Trigger for customer analysis workflow",
                expected_fields=["analysisType", "roomType", "ageGroup", "customerEmail", "customerName"]
            ),
            WorkflowType.FOLLOW_UP_SEQUENCES: WorkflowConfiguration(
                name="Follow-up Sequences Workflow",
                workflow_type=WorkflowType.FOLLOW_UP_SEQUENCES,
                webhook_url=f"{webhook_base_url}/follow-up-trigger",
                description="Trigger for follow-up sequences workflow",
                expected_fields=["followUpType", "customerData", "leadScore", "followUpAction"]
            ),
            WorkflowType.CRM_LEAD_MANAGEMENT: WorkflowConfiguration(
                name="CRM Lead Management Workflow",
                workflow_type=WorkflowType.CRM_LEAD_MANAGEMENT,
                webhook_url=f"{webhook_base_url}/crm-lead-trigger",
                description="Trigger for CRM lead management workflow",
                expected_fields=["customerName", "customerEmail", "analysisData", "roomType", "analysisType"]
            ),
            WorkflowType.PHOTO_ANALYSIS_PROCESSING: WorkflowConfiguration(
                name="Photo Analysis Processing Workflow",
                workflow_type=WorkflowType.PHOTO_ANALYSIS_PROCESSING,
                webhook_url=f"{webhook_base_url}/photo-analysis-processing",
                description="Trigger for photo analysis result processing workflow",
                expected_fields=["extractedColors", "roomContext", "recommendations", "metadata"]
            )
        }

    async def __aenter__(self):
        """Async context manager entry"""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit"""
        await self.close()

    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()

    async def health_check(self) -> WorkflowHealthCheck:
        """
        Perform comprehensive health check of N8N and webhook services
        """
        start_time = datetime.now()

        # Check N8N API connectivity
        n8n_status = await self._check_n8n_api()

        # Check webhook server status
        webhook_status = await self._check_webhook_server()

        # Get active workflow count
        active_workflows = await self._get_active_workflow_count()

        # Check service endpoints
        service_endpoints = await self._check_service_endpoints()

        # Determine overall status
        overall_status = "healthy" if n8n_status and webhook_status else "degraded"
        if not n8n_status and not webhook_status:
            overall_status = "unhealthy"

        return WorkflowHealthCheck(
            status=overall_status,
            n8n_connection=n8n_status,
            webhook_server_status=webhook_status,
            active_workflows=active_workflows,
            queue_size=0,  # Would be implemented with actual queue system
            last_health_check=start_time,
            service_endpoints=service_endpoints
        )

    async def trigger_workflow(
        self,
        workflow_type: WorkflowType,
        data: Dict[str, Any],
        correlation_id: Optional[str] = None
    ) -> WorkflowExecution:
        """
        Trigger a specific N8N workflow through webhook
        """
        config = self.workflow_configs.get(workflow_type)
        if not config:
            raise N8NAPIError(f"Unknown workflow type: {workflow_type}")

        # Generate execution ID
        execution_id = f"{workflow_type.value}_{int(time.time() * 1000)}"

        # Prepare workflow data
        workflow_data = {
            **data,
            "triggeredAt": datetime.now().isoformat(),
            "source": "sanzo-n8n-mcp",
            "workflowType": workflow_type.value,
            "executionId": execution_id,
            "correlationId": correlation_id
        }

        # Create execution record
        execution = WorkflowExecution(
            execution_id=execution_id,
            workflow_type=workflow_type,
            status=WorkflowStatus.PENDING,
            input_data=workflow_data,
            started_at=datetime.now(),
            correlation_id=correlation_id
        )

        try:
            # Use webhook server as proxy to N8N
            webhook_endpoint = f"{self.webhook_server_url}/api/webhooks/{workflow_type.value}"

            execution.status = WorkflowStatus.RUNNING
            response = await self.client.post(webhook_endpoint, json=workflow_data)

            if response.status_code == 200:
                result = response.json()
                execution.status = WorkflowStatus.COMPLETED
                execution.output_data = result
                execution.n8n_execution_id = result.get("workflowId")
                execution.completed_at = datetime.now()
                execution.duration_seconds = (
                    execution.completed_at - execution.started_at
                ).total_seconds()
            else:
                execution.status = WorkflowStatus.FAILED
                execution.error_message = f"HTTP {response.status_code}: {response.text}"
                execution.completed_at = datetime.now()

        except Exception as e:
            execution.status = WorkflowStatus.FAILED
            execution.error_message = str(e)
            execution.completed_at = datetime.now()

        return execution

    async def batch_trigger_workflows(
        self,
        workflow_types: List[WorkflowType],
        shared_data: Dict[str, Any],
        individual_data: Optional[Dict[WorkflowType, Dict[str, Any]]] = None,
        delay_ms: int = 0,
        correlation_id: Optional[str] = None
    ) -> List[WorkflowExecution]:
        """
        Trigger multiple workflows in sequence or parallel
        """
        executions = []
        individual_data = individual_data or {}

        for i, workflow_type in enumerate(workflow_types):
            # Merge shared and individual data
            workflow_data = {**shared_data}
            if workflow_type in individual_data:
                workflow_data.update(individual_data[workflow_type])

            # Add batch metadata
            workflow_data["batchId"] = correlation_id or f"batch_{int(time.time())}"
            workflow_data["batchIndex"] = i
            workflow_data["batchTotal"] = len(workflow_types)

            # Execute workflow
            execution = await self.trigger_workflow(
                workflow_type=workflow_type,
                data=workflow_data,
                correlation_id=correlation_id
            )
            executions.append(execution)

            # Add delay between executions if specified
            if delay_ms > 0 and i < len(workflow_types) - 1:
                await asyncio.sleep(delay_ms / 1000)

        return executions

    async def get_workflow_execution(self, execution_id: str) -> Optional[WorkflowExecution]:
        """
        Get workflow execution status from N8N API
        """
        try:
            # This would query N8N API for execution details
            # For now, we'll simulate the response
            url = f"{self.n8n_base_url}/api/v1/executions/{execution_id}"
            response = await self.client.get(url)

            if response.status_code == 200:
                data = response.json()
                # Convert N8N execution data to our model
                return self._convert_n8n_execution(data)

        except Exception as e:
            print(f"Error getting execution {execution_id}: {e}")

        return None

    async def list_workflow_executions(
        self,
        workflow_type: Optional[WorkflowType] = None,
        status: Optional[WorkflowStatus] = None,
        limit: int = 50
    ) -> List[WorkflowExecution]:
        """
        List recent workflow executions with optional filters
        """
        try:
            params = {"limit": limit}
            if workflow_type:
                params["workflowType"] = workflow_type.value
            if status:
                params["status"] = status.value

            url = f"{self.n8n_base_url}/api/v1/executions"
            response = await self.client.get(url, params=params)

            if response.status_code == 200:
                data = response.json()
                executions = []
                for item in data.get("data", []):
                    execution = self._convert_n8n_execution(item)
                    if execution:
                        executions.append(execution)
                return executions

        except Exception as e:
            print(f"Error listing executions: {e}")

        return []

    async def cancel_workflow_execution(self, execution_id: str) -> bool:
        """
        Cancel a running workflow execution
        """
        try:
            url = f"{self.n8n_base_url}/api/v1/executions/{execution_id}/stop"
            response = await self.client.post(url)
            return response.status_code == 200

        except Exception as e:
            print(f"Error cancelling execution {execution_id}: {e}")
            return False

    async def get_workflow_metrics(self, workflow_type: WorkflowType) -> Dict[str, Any]:
        """
        Get performance metrics for a specific workflow type
        """
        executions = await self.list_workflow_executions(workflow_type=workflow_type, limit=100)

        if not executions:
            return {
                "total_executions": 0,
                "successful_executions": 0,
                "failed_executions": 0,
                "average_duration": 0.0,
                "success_rate": 0.0
            }

        total = len(executions)
        successful = len([e for e in executions if e.status == WorkflowStatus.COMPLETED])
        failed = len([e for e in executions if e.status == WorkflowStatus.FAILED])

        durations = [e.duration_seconds for e in executions if e.duration_seconds]
        avg_duration = sum(durations) / len(durations) if durations else 0.0

        return {
            "total_executions": total,
            "successful_executions": successful,
            "failed_executions": failed,
            "average_duration": avg_duration,
            "success_rate": (successful / total * 100) if total > 0 else 0.0
        }

    # Private helper methods
    async def _check_n8n_api(self) -> bool:
        """Check N8N API connectivity"""
        try:
            response = await self.client.get(f"{self.n8n_base_url}/api/v1/workflows")
            return response.status_code == 200
        except Exception:
            return False

    async def _check_webhook_server(self) -> bool:
        """Check webhook server connectivity"""
        try:
            response = await self.client.get(f"{self.webhook_server_url}/api/health")
            return response.status_code == 200
        except Exception:
            return False

    async def _get_active_workflow_count(self) -> int:
        """Get count of currently running workflows"""
        executions = await self.list_workflow_executions(status=WorkflowStatus.RUNNING)
        return len(executions)

    async def _check_service_endpoints(self) -> Dict[str, bool]:
        """Check status of various service endpoints"""
        endpoints = {
            "n8n_api": f"{self.n8n_base_url}/api/v1/workflows",
            "webhook_server": f"{self.webhook_server_url}/api/health",
            "sanzo_api": "http://localhost:3000/api/health",
            "photo_analysis": "http://localhost:3002/api/health"
        }

        status = {}
        for name, url in endpoints.items():
            try:
                response = await self.client.get(url)
                status[name] = response.status_code == 200
            except Exception:
                status[name] = False

        return status

    def _convert_n8n_execution(self, n8n_data: Dict[str, Any]) -> Optional[WorkflowExecution]:
        """Convert N8N execution data to our model"""
        try:
            # This would parse actual N8N execution format
            # For now, return a mock conversion
            return WorkflowExecution(
                execution_id=n8n_data.get("id", "unknown"),
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,  # Would be parsed from data
                status=WorkflowStatus.COMPLETED,  # Would be mapped from N8N status
                input_data=n8n_data.get("data", {}),
                started_at=datetime.now(),
                n8n_execution_id=n8n_data.get("id")
            )
        except Exception as e:
            print(f"Error converting N8N execution data: {e}")
            return None
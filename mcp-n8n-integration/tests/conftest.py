"""
Pytest configuration and fixtures for Sanzo N8N MCP tests
"""

import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from datetime import datetime

from sanzo_n8n_mcp.models import WorkflowType, WorkflowStatus, WorkflowExecution
from sanzo_n8n_mcp.n8n_client import N8NClient
from sanzo_n8n_mcp.workflow_manager import WorkflowManager
from sanzo_n8n_mcp.server import SanzoN8NMCPServer


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
async def mock_n8n_client():
    """Mock N8N client for testing"""
    client = AsyncMock(spec=N8NClient)

    # Mock successful workflow execution
    mock_execution = WorkflowExecution(
        execution_id="test_execution_123",
        workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
        status=WorkflowStatus.COMPLETED,
        input_data={"test": "data"},
        started_at=datetime.now(),
        completed_at=datetime.now(),
        duration_seconds=1.5
    )

    client.trigger_workflow.return_value = mock_execution
    client.get_workflow_execution.return_value = mock_execution
    client.list_workflow_executions.return_value = [mock_execution]
    client.cancel_workflow_execution.return_value = True

    # Mock health check
    client.health_check.return_value = MagicMock(
        status="healthy",
        n8n_connection=True,
        webhook_server_status=True,
        active_workflows=0,
        queue_size=0
    )

    return client


@pytest.fixture
async def mock_workflow_manager(mock_n8n_client):
    """Mock workflow manager for testing"""
    manager = AsyncMock(spec=WorkflowManager)
    manager.n8n_client = mock_n8n_client

    # Mock execution results
    mock_execution = WorkflowExecution(
        execution_id="test_execution_123",
        workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
        status=WorkflowStatus.COMPLETED,
        input_data={"test": "data"},
        started_at=datetime.now(),
        completed_at=datetime.now(),
        duration_seconds=1.5
    )

    manager.execute_workflow.return_value = mock_execution
    manager.get_workflow_metrics.return_value = MagicMock(
        total_executions=10,
        successful_executions=9,
        failed_executions=1,
        success_rate=90.0
    )
    manager.get_queue_status.return_value = {
        "queue_size": 0,
        "running_workflows": 1,
        "completed_workflows": 10
    }

    return manager


@pytest.fixture
async def mcp_server(mock_workflow_manager, mock_n8n_client):
    """Mock MCP server for testing"""
    server = SanzoN8NMCPServer()
    server.workflow_manager = mock_workflow_manager
    server.n8n_client = mock_n8n_client
    return server


@pytest.fixture
def sample_workflow_data():
    """Sample workflow input data for testing"""
    return {
        "customer_analysis": {
            "analysisType": "photo",
            "roomType": "living_room",
            "customerEmail": "test@example.com",
            "customerName": "Test Customer"
        },
        "photo_analysis": {
            "extractedColors": ["#FF5733", "#33FF57", "#3357FF"],
            "roomContext": {"room_type": "bedroom", "lighting": "natural"},
            "recommendations": [{"color": "#FF5733", "usage": "accent"}],
            "confidence": 0.85
        },
        "crm_lead": {
            "customerName": "Test Customer",
            "customerEmail": "test@example.com",
            "analysisData": {"colors": ["#FF5733"]},
            "roomType": "kitchen",
            "analysisType": "preferences"
        },
        "follow_up": {
            "followUpType": "personal",
            "customerData": {"email": "test@example.com", "name": "Test Customer"},
            "leadScore": 75,
            "followUpAction": "email"
        }
    }


@pytest.fixture
def sample_batch_request():
    """Sample batch workflow request for testing"""
    return {
        "workflows": [
            WorkflowType.CUSTOMER_ANALYSIS,
            WorkflowType.CRM_LEAD_MANAGEMENT
        ],
        "shared_data": {
            "customerEmail": "test@example.com",
            "source": "test_batch"
        },
        "individual_data": {
            WorkflowType.CUSTOMER_ANALYSIS: {
                "analysisType": "photo",
                "roomType": "living_room"
            },
            WorkflowType.CRM_LEAD_MANAGEMENT: {
                "leadSource": "batch_processing"
            }
        }
    }


@pytest.fixture
def mock_n8n_responses():
    """Mock N8N API responses for testing"""
    return {
        "health_check": {
            "status": "ok",
            "service": "n8n",
            "version": "1.0.0"
        },
        "trigger_workflow": {
            "success": True,
            "workflowId": "test_workflow_123",
            "executionId": "test_execution_123"
        },
        "execution_status": {
            "id": "test_execution_123",
            "status": "success",
            "data": {"result": "completed"},
            "startedAt": "2023-01-01T12:00:00Z",
            "finishedAt": "2023-01-01T12:01:30Z"
        }
    }


@pytest.fixture
def webhook_payloads():
    """Sample webhook payloads for testing"""
    return {
        "customer_analysis": {
            "analysisType": "photo",
            "roomType": "bedroom",
            "customerEmail": "webhook@example.com",
            "customerName": "Webhook Customer",
            "triggeredAt": "2023-01-01T12:00:00Z"
        },
        "photo_processing": {
            "extractedColors": ["#1A2B3C", "#4D5E6F"],
            "roomContext": {"room": "office"},
            "recommendations": [],
            "confidence": 0.9
        }
    }
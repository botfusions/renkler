"""
Tests for MCP Server functionality
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from sanzo_n8n_mcp.server import SanzoN8NMCPServer
from sanzo_n8n_mcp.models import (
    WorkflowType,
    WorkflowStatus,
    WorkflowExecution,
    BatchWorkflowResult
)


class TestSanzoN8NMCPServer:
    """Test suite for SanzoN8NMCPServer"""

    @pytest.fixture
    async def mcp_server_initialized(self, mock_workflow_manager, mock_n8n_client):
        """Create and initialize MCP server for testing"""
        server = SanzoN8NMCPServer()
        server.workflow_manager = mock_workflow_manager
        server.n8n_client = mock_n8n_client
        return server

    @pytest.mark.asyncio
    async def test_server_initialization(self):
        """Test MCP server initialization"""
        server = SanzoN8NMCPServer()
        assert server.mcp is not None
        assert server.n8n_client is None
        assert server.workflow_manager is None

    @pytest.mark.asyncio
    @patch('sanzo_n8n_mcp.server.N8NClient')
    @patch('sanzo_n8n_mcp.server.WorkflowManager')
    async def test_initialize_with_environment(self, mock_workflow_manager_class, mock_n8n_client_class):
        """Test server initialization with environment variables"""
        with patch.dict('os.environ', {
            'N8N_BASE_URL': 'http://test:5678',
            'N8N_API_KEY': 'test_key',
            'WEBHOOK_SERVER_URL': 'http://test:3003'
        }):
            server = SanzoN8NMCPServer()
            await server.initialize()

            # Check that N8N client was created with correct parameters
            mock_n8n_client_class.assert_called_once_with(
                n8n_base_url='http://test:5678',
                webhook_base_url='http://localhost:5678/webhook',
                webhook_server_url='http://test:3003',
                api_key='test_key'
            )

            # Check that workflow manager was created and started
            mock_workflow_manager_class.assert_called_once()
            server.workflow_manager.start.assert_called_once()

    @pytest.mark.asyncio
    async def test_cleanup(self, mcp_server_initialized):
        """Test server cleanup"""
        server = mcp_server_initialized

        await server.cleanup()

        server.workflow_manager.stop.assert_called_once()
        server.n8n_client.close.assert_called_once()

    @pytest.mark.asyncio
    async def test_execute_workflow_tool(self, mcp_server_initialized, sample_workflow_data):
        """Test execute_workflow MCP tool"""
        server = mcp_server_initialized

        # Mock successful execution
        mock_execution = WorkflowExecution(
            execution_id="test_123",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            input_data=sample_workflow_data["customer_analysis"],
            started_at=datetime.now()
        )
        server.workflow_manager.execute_workflow.return_value = mock_execution

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        execute_tool = tools["execute_workflow"]

        # Execute the tool
        result = await execute_tool.func(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            data=sample_workflow_data["customer_analysis"],
            priority=7,
            correlation_id="test_correlation"
        )

        # Assertions
        assert result == mock_execution
        server.workflow_manager.execute_workflow.assert_called_once_with(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            data=sample_workflow_data["customer_analysis"],
            priority=7,
            correlation_id="test_correlation",
            timeout_override=None
        )

    @pytest.mark.asyncio
    async def test_execute_workflow_tool_not_initialized(self):
        """Test execute_workflow tool when manager not initialized"""
        server = SanzoN8NMCPServer()

        tools = {tool.name: tool for tool in server.mcp.tools}
        execute_tool = tools["execute_workflow"]

        with pytest.raises(RuntimeError, match="Workflow manager not initialized"):
            await execute_tool.func(
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                data={"test": "data"}
            )

    @pytest.mark.asyncio
    async def test_execute_batch_workflows_tool(self, mcp_server_initialized):
        """Test execute_batch_workflows MCP tool"""
        server = mcp_server_initialized

        # Mock batch result
        mock_result = BatchWorkflowResult(
            batch_id="batch_123",
            total_workflows=2,
            successful_workflows=2,
            failed_workflows=0,
            execution_results=[],
            started_at=datetime.now()
        )
        server.workflow_manager.execute_batch_workflows.return_value = mock_result

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        batch_tool = tools["execute_batch_workflows"]

        # Execute the tool
        result = await batch_tool.func(
            workflows=[WorkflowType.CUSTOMER_ANALYSIS, WorkflowType.CRM_LEAD_MANAGEMENT],
            shared_data={"source": "test"},
            individual_data={
                "customer-analysis": {"analysisType": "photo"},
                "crm-lead-management": {"leadSource": "test"}
            },
            delay_between_workflows=1000,
            correlation_id="batch_test"
        )

        # Assertions
        assert result == mock_result
        server.workflow_manager.execute_batch_workflows.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workflow_status_tool(self, mcp_server_initialized):
        """Test get_workflow_status MCP tool"""
        server = mcp_server_initialized

        # Mock execution
        mock_execution = WorkflowExecution(
            execution_id="test_123",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            input_data={},
            started_at=datetime.now()
        )
        server.n8n_client.get_workflow_execution.return_value = mock_execution

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        status_tool = tools["get_workflow_status"]

        # Execute the tool
        result = await status_tool.func(execution_id="test_123")

        # Assertions
        assert result == mock_execution
        server.n8n_client.get_workflow_execution.assert_called_once_with("test_123")

    @pytest.mark.asyncio
    async def test_list_workflow_executions_tool(self, mcp_server_initialized):
        """Test list_workflow_executions MCP tool"""
        server = mcp_server_initialized

        # Mock executions list
        mock_executions = [
            WorkflowExecution(
                execution_id="test_1",
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                status=WorkflowStatus.COMPLETED,
                input_data={},
                started_at=datetime.now()
            )
        ]
        server.n8n_client.list_workflow_executions.return_value = mock_executions

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        list_tool = tools["list_workflow_executions"]

        # Execute the tool
        result = await list_tool.func(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            limit=10
        )

        # Assertions
        assert result == mock_executions
        server.n8n_client.list_workflow_executions.assert_called_once_with(
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            limit=10
        )

    @pytest.mark.asyncio
    async def test_get_workflow_metrics_tool(self, mcp_server_initialized):
        """Test get_workflow_metrics MCP tool"""
        server = mcp_server_initialized

        # Mock metrics
        mock_metrics = MagicMock()
        mock_metrics.workflow_type = WorkflowType.CUSTOMER_ANALYSIS
        mock_metrics.success_rate = 95.0
        server.workflow_manager.get_workflow_metrics.return_value = mock_metrics

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        metrics_tool = tools["get_workflow_metrics"]

        # Execute the tool
        result = await metrics_tool.func(workflow_type=WorkflowType.CUSTOMER_ANALYSIS)

        # Assertions
        assert result == mock_metrics
        server.workflow_manager.get_workflow_metrics.assert_called_once_with(
            WorkflowType.CUSTOMER_ANALYSIS
        )

    @pytest.mark.asyncio
    async def test_health_check_tool(self, mcp_server_initialized):
        """Test health_check MCP tool"""
        server = mcp_server_initialized

        # Mock health check result
        mock_health = MagicMock()
        mock_health.status = "healthy"
        server.n8n_client.health_check.return_value = mock_health

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        health_tool = tools["health_check"]

        # Execute the tool
        result = await health_tool.func()

        # Assertions
        assert result == mock_health
        server.n8n_client.health_check.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_workflow_tool(self, mcp_server_initialized):
        """Test cancel_workflow MCP tool"""
        server = mcp_server_initialized

        # Mock cancellation success
        server.n8n_client.cancel_workflow_execution.return_value = True

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        cancel_tool = tools["cancel_workflow"]

        # Execute the tool
        result = await cancel_tool.func(execution_id="test_123")

        # Assertions
        assert result is True
        server.n8n_client.cancel_workflow_execution.assert_called_once_with("test_123")

    @pytest.mark.asyncio
    async def test_trigger_customer_analysis_tool(self, mcp_server_initialized):
        """Test trigger_customer_analysis convenience tool"""
        server = mcp_server_initialized

        # Mock execution
        mock_execution = WorkflowExecution(
            execution_id="quick_analysis_123",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            status=WorkflowStatus.COMPLETED,
            input_data={},
            started_at=datetime.now()
        )
        server.workflow_manager.execute_workflow.return_value = mock_execution

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        analysis_tool = tools["trigger_customer_analysis"]

        # Execute the tool
        result = await analysis_tool.func(
            analysis_type="photo",
            room_type="living_room",
            customer_email="test@example.com",
            customer_name="Test Customer",
            age_group="25-35",
            additional_data={"preference": "modern"}
        )

        # Assertions
        assert result == mock_execution

        # Check that workflow was called with correct data
        call_args = server.workflow_manager.execute_workflow.call_args
        assert call_args[1]['workflow_type'] == WorkflowType.CUSTOMER_ANALYSIS
        assert call_args[1]['data']['analysisType'] == "photo"
        assert call_args[1]['data']['roomType'] == "living_room"
        assert call_args[1]['data']['customerEmail'] == "test@example.com"
        assert call_args[1]['data']['preference'] == "modern"

    @pytest.mark.asyncio
    async def test_trigger_photo_analysis_processing_tool(self, mcp_server_initialized):
        """Test trigger_photo_analysis_processing tool"""
        server = mcp_server_initialized

        # Mock execution
        mock_execution = WorkflowExecution(
            execution_id="photo_analysis_123",
            workflow_type=WorkflowType.PHOTO_ANALYSIS_PROCESSING,
            status=WorkflowStatus.COMPLETED,
            input_data={},
            started_at=datetime.now()
        )
        server.workflow_manager.execute_workflow.return_value = mock_execution

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        photo_tool = tools["trigger_photo_analysis_processing"]

        # Execute the tool
        result = await photo_tool.func(
            extracted_colors=["#FF5733", "#33FF57"],
            room_context={"room_type": "bedroom"},
            recommendations=[{"color": "#FF5733", "usage": "accent"}],
            confidence=0.9,
            metadata={"camera": "iPhone"}
        )

        # Assertions
        assert result == mock_execution

        # Check that workflow was called with correct data
        call_args = server.workflow_manager.execute_workflow.call_args
        assert call_args[1]['workflow_type'] == WorkflowType.PHOTO_ANALYSIS_PROCESSING
        assert call_args[1]['data']['extractedColors'] == ["#FF5733", "#33FF57"]
        assert call_args[1]['data']['confidence'] == 0.9

    @pytest.mark.asyncio
    async def test_get_queue_status_tool(self, mcp_server_initialized):
        """Test get_queue_status tool"""
        server = mcp_server_initialized

        # Mock queue status
        mock_status = {
            "queue_size": 5,
            "running_workflows": 2,
            "completed_workflows": 100
        }
        server.workflow_manager.get_queue_status.return_value = mock_status

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        queue_tool = tools["get_queue_status"]

        # Execute the tool
        result = await queue_tool.func()

        # Assertions
        assert result == mock_status
        server.workflow_manager.get_queue_status.assert_called_once()

    @pytest.mark.asyncio
    async def test_add_automated_trigger_tool(self, mcp_server_initialized):
        """Test add_automated_trigger tool"""
        server = mcp_server_initialized

        # Mock successful addition
        server.workflow_manager.add_automated_trigger.return_value = None

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        trigger_tool = tools["add_automated_trigger"]

        # Execute the tool
        result = await trigger_tool.func(
            trigger_name="test_trigger",
            workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
            trigger_conditions={"condition": "value"},
            enabled=True,
            max_executions_per_hour=10
        )

        # Assertions
        assert result is True
        server.workflow_manager.add_automated_trigger.assert_called_once()

    @pytest.mark.asyncio
    async def test_list_automated_triggers_tool(self, mcp_server_initialized):
        """Test list_automated_triggers tool"""
        server = mcp_server_initialized

        # Mock triggers list
        mock_triggers = [MagicMock(), MagicMock()]
        server.workflow_manager.list_automated_triggers.return_value = mock_triggers

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        list_triggers_tool = tools["list_automated_triggers"]

        # Execute the tool
        result = await list_triggers_tool.func()

        # Assertions
        assert result == mock_triggers
        server.workflow_manager.list_automated_triggers.assert_called_once()

    @pytest.mark.asyncio
    async def test_remove_automated_trigger_tool(self, mcp_server_initialized):
        """Test remove_automated_trigger tool"""
        server = mcp_server_initialized

        # Mock successful removal
        server.workflow_manager.remove_automated_trigger.return_value = True

        # Get the tool function
        tools = {tool.name: tool for tool in server.mcp.tools}
        remove_trigger_tool = tools["remove_automated_trigger"]

        # Execute the tool
        result = await remove_trigger_tool.func(trigger_name="test_trigger")

        # Assertions
        assert result is True
        server.workflow_manager.remove_automated_trigger.assert_called_once_with("test_trigger")

    @pytest.mark.asyncio
    async def test_get_server(self, mcp_server_initialized):
        """Test get_server method"""
        server = mcp_server_initialized
        mcp_instance = server.get_server()

        assert mcp_instance == server.mcp

    @pytest.mark.asyncio
    async def test_all_tools_registered(self, mcp_server_initialized):
        """Test that all expected tools are registered"""
        server = mcp_server_initialized
        tool_names = {tool.name for tool in server.mcp.tools}

        expected_tools = {
            "execute_workflow",
            "execute_batch_workflows",
            "get_workflow_status",
            "list_workflow_executions",
            "get_workflow_metrics",
            "health_check",
            "cancel_workflow",
            "trigger_customer_analysis",
            "trigger_photo_analysis_processing",
            "trigger_crm_lead_management",
            "trigger_follow_up_sequences",
            "get_queue_status",
            "add_automated_trigger",
            "list_automated_triggers",
            "remove_automated_trigger"
        }

        assert tool_names == expected_tools

    @pytest.mark.asyncio
    async def test_tool_descriptions_present(self, mcp_server_initialized):
        """Test that all tools have descriptions"""
        server = mcp_server_initialized

        for tool in server.mcp.tools:
            assert tool.description is not None
            assert len(tool.description) > 0

    @pytest.mark.asyncio
    async def test_error_handling_in_tools(self, mcp_server_initialized):
        """Test error handling in tools when dependencies fail"""
        server = mcp_server_initialized

        # Make workflow manager raise an exception
        server.workflow_manager.execute_workflow.side_effect = Exception("Test error")

        tools = {tool.name: tool for tool in server.mcp.tools}
        execute_tool = tools["execute_workflow"]

        # Should propagate the exception
        with pytest.raises(Exception, match="Test error"):
            await execute_tool.func(
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                data={"test": "data"}
            )
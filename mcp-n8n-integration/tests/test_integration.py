"""
Integration tests for the complete MCP-N8N pipeline
"""

import pytest
import asyncio
import json
from unittest.mock import AsyncMock, MagicMock, patch
from datetime import datetime

from sanzo_n8n_mcp.server import SanzoN8NMCPServer, create_server
from sanzo_n8n_mcp.models import WorkflowType, WorkflowStatus
from sanzo_n8n_mcp.n8n_client import N8NClient
from sanzo_n8n_mcp.workflow_manager import WorkflowManager


class TestMCPN8NIntegration:
    """Integration tests for the complete MCP-N8N system"""

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_end_to_end_workflow_execution(self, sample_workflow_data):
        """Test complete end-to-end workflow execution"""

        # Mock external HTTP calls
        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            # Mock webhook server response
            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {
                    "success": True,
                    "workflowId": "n8n_workflow_123",
                    "message": "Workflow triggered successfully"
                }
            )

            # Mock health check responses
            mock_get.return_value = MagicMock(status_code=200)

            # Create and initialize server
            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                # Test customer analysis workflow
                tools = {tool.name: tool for tool in server.mcp.tools}
                execute_tool = tools["execute_workflow"]

                # Execute workflow
                result = await execute_tool.func(
                    workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                    data=sample_workflow_data["customer_analysis"],
                    correlation_id="integration_test_001"
                )

                # Verify results
                assert result is not None
                assert result.workflow_type == WorkflowType.CUSTOMER_ANALYSIS
                assert result.correlation_id == "integration_test_001"
                assert result.status in [WorkflowStatus.COMPLETED, WorkflowStatus.RUNNING]

                # Verify webhook was called
                assert mock_post.called
                call_args = mock_post.call_args
                assert "customer-analysis" in str(call_args)

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_batch_workflow_integration(self, sample_batch_request):
        """Test batch workflow execution integration"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            # Mock successful responses
            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {"success": True, "workflowId": "batch_workflow_123"}
            )
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}
                batch_tool = tools["execute_batch_workflows"]

                # Execute batch workflows
                result = await batch_tool.func(
                    workflows=sample_batch_request["workflows"],
                    shared_data=sample_batch_request["shared_data"],
                    individual_data={
                        "customer-analysis": sample_batch_request["individual_data"][WorkflowType.CUSTOMER_ANALYSIS],
                        "crm-lead-management": sample_batch_request["individual_data"][WorkflowType.CRM_LEAD_MANAGEMENT]
                    },
                    correlation_id="batch_integration_test"
                )

                # Verify batch results
                assert result is not None
                assert result.batch_id == "batch_integration_test"
                assert result.total_workflows == 2
                assert len(result.execution_results) <= 2  # May be less due to mocking

                # Verify multiple webhook calls were made
                assert mock_post.call_count >= 1

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_health_check_integration(self):
        """Test health check integration with all services"""

        with patch('httpx.AsyncClient.get') as mock_get:
            # Mock different service responses
            def mock_get_side_effect(url, **kwargs):
                response = MagicMock()
                if "n8n" in str(url):
                    response.status_code = 200  # N8N is healthy
                elif "webhook" in str(url):
                    response.status_code = 200  # Webhook server is healthy
                elif "3000" in str(url):
                    response.status_code = 200  # Sanzo API is healthy
                elif "3002" in str(url):
                    response.status_code = 500  # Photo analysis is down
                else:
                    response.status_code = 200
                return response

            mock_get.side_effect = mock_get_side_effect

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}
                health_tool = tools["health_check"]

                # Execute health check
                health = await health_tool.func()

                # Verify health check results
                assert health is not None
                assert health.status in ["healthy", "degraded"]
                assert health.n8n_connection is True
                assert health.webhook_server_status is True
                assert "photo_analysis" in health.service_endpoints
                assert health.service_endpoints["photo_analysis"] is False  # This one is down

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_workflow_lifecycle_management(self):
        """Test complete workflow lifecycle: create, monitor, cancel"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            # Mock workflow execution
            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {"success": True, "workflowId": "lifecycle_test_123"}
            )
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}

                # 1. Execute workflow
                execute_tool = tools["execute_workflow"]
                execution_result = await execute_tool.func(
                    workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                    data={"analysisType": "photo", "roomType": "kitchen"},
                    correlation_id="lifecycle_test"
                )

                execution_id = execution_result.execution_id

                # 2. Check workflow status
                status_tool = tools["get_workflow_status"]
                with patch.object(server.n8n_client, 'get_workflow_execution') as mock_get_execution:
                    mock_get_execution.return_value = execution_result

                    status_result = await status_tool.func(execution_id=execution_id)
                    assert status_result is not None
                    assert status_result.execution_id == execution_id

                # 3. List recent executions
                list_tool = tools["list_workflow_executions"]
                with patch.object(server.n8n_client, 'list_workflow_executions') as mock_list:
                    mock_list.return_value = [execution_result]

                    list_result = await list_tool.func(
                        workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                        limit=10
                    )
                    assert len(list_result) == 1
                    assert list_result[0].execution_id == execution_id

                # 4. Cancel workflow (if needed)
                cancel_tool = tools["cancel_workflow"]
                with patch.object(server.n8n_client, 'cancel_workflow_execution') as mock_cancel:
                    mock_cancel.return_value = True

                    cancel_result = await cancel_tool.func(execution_id=execution_id)
                    assert cancel_result is True

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_automated_trigger_integration(self):
        """Test automated trigger configuration and management"""

        with patch('httpx.AsyncClient.get') as mock_get:
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}

                # 1. Add automated trigger
                add_trigger_tool = tools["add_automated_trigger"]
                add_result = await add_trigger_tool.func(
                    trigger_name="integration_test_trigger",
                    workflow_type=WorkflowType.FOLLOW_UP_SEQUENCES,
                    trigger_conditions={"condition": "test_value"},
                    enabled=True,
                    max_executions_per_hour=5
                )
                assert add_result is True

                # 2. List triggers
                list_triggers_tool = tools["list_automated_triggers"]
                list_result = await list_triggers_tool.func()

                trigger_names = [trigger.trigger_name for trigger in list_result]
                assert "integration_test_trigger" in trigger_names

                # 3. Remove trigger
                remove_trigger_tool = tools["remove_automated_trigger"]
                remove_result = await remove_trigger_tool.func(
                    trigger_name="integration_test_trigger"
                )
                assert remove_result is True

                # 4. Verify trigger was removed
                list_result_after = await list_triggers_tool.func()
                trigger_names_after = [trigger.trigger_name for trigger in list_result_after]
                assert "integration_test_trigger" not in trigger_names_after

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_metrics_and_analytics_integration(self):
        """Test metrics collection and analytics integration"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {"success": True, "workflowId": "metrics_test_123"}
            )
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}

                # Execute some workflows to generate metrics
                execute_tool = tools["execute_workflow"]

                for i in range(3):
                    await execute_tool.func(
                        workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                        data={"analysisType": "photo", "iteration": i},
                        correlation_id=f"metrics_test_{i}"
                    )

                # Get workflow metrics
                metrics_tool = tools["get_workflow_metrics"]
                metrics_result = await metrics_tool.func(
                    workflow_type=WorkflowType.CUSTOMER_ANALYSIS
                )

                assert metrics_result is not None
                assert metrics_result.workflow_type == WorkflowType.CUSTOMER_ANALYSIS

                # Get queue status
                queue_tool = tools["get_queue_status"]
                queue_result = await queue_tool.func()

                assert queue_result is not None
                assert "queue_size" in queue_result
                assert "running_workflows" in queue_result

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_convenience_tools_integration(self, sample_workflow_data):
        """Test convenience tools for specific workflow types"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {"success": True, "workflowId": "convenience_test_123"}
            )
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}

                # Test customer analysis convenience tool
                customer_tool = tools["trigger_customer_analysis"]
                customer_result = await customer_tool.func(
                    analysis_type="photo",
                    room_type="bedroom",
                    customer_email="convenience@test.com",
                    customer_name="Convenience Test"
                )
                assert customer_result.workflow_type == WorkflowType.CUSTOMER_ANALYSIS

                # Test photo analysis convenience tool
                photo_tool = tools["trigger_photo_analysis_processing"]
                photo_result = await photo_tool.func(
                    extracted_colors=["#FF5733", "#33FF57"],
                    room_context={"room_type": "office"},
                    confidence=0.85
                )
                assert photo_result.workflow_type == WorkflowType.PHOTO_ANALYSIS_PROCESSING

                # Test CRM lead convenience tool
                crm_tool = tools["trigger_crm_lead_management"]
                crm_result = await crm_tool.func(
                    customer_name="CRM Test",
                    customer_email="crm@test.com",
                    analysis_data={"colors": ["#FF5733"]},
                    room_type="living_room",
                    analysis_type="preferences"
                )
                assert crm_result.workflow_type == WorkflowType.CRM_LEAD_MANAGEMENT

                # Test follow-up convenience tool
                followup_tool = tools["trigger_follow_up_sequences"]
                followup_result = await followup_tool.func(
                    follow_up_type="personal",
                    customer_data={"email": "followup@test.com"},
                    lead_score=85
                )
                assert followup_result.workflow_type == WorkflowType.FOLLOW_UP_SEQUENCES

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_error_handling_integration(self):
        """Test error handling in integration scenarios"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            # Mock various error scenarios
            mock_post.return_value = MagicMock(
                status_code=500,
                text="Internal Server Error"
            )
            mock_get.return_value = MagicMock(status_code=500)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}

                # Test workflow execution with service error
                execute_tool = tools["execute_workflow"]
                result = await execute_tool.func(
                    workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                    data={"analysisType": "photo"},
                    correlation_id="error_test"
                )

                # Should handle error gracefully
                assert result is not None
                assert result.status == WorkflowStatus.FAILED
                assert result.error_message is not None

                # Test health check with service errors
                health_tool = tools["health_check"]
                health_result = await health_tool.func()

                # Should indicate unhealthy status
                assert health_result.status == "unhealthy"
                assert health_result.n8n_connection is False

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_concurrent_workflow_execution(self):
        """Test concurrent workflow execution"""

        with patch('httpx.AsyncClient.post') as mock_post, \
             patch('httpx.AsyncClient.get') as mock_get:

            mock_post.return_value = MagicMock(
                status_code=200,
                json=lambda: {"success": True, "workflowId": "concurrent_test"}
            )
            mock_get.return_value = MagicMock(status_code=200)

            server = SanzoN8NMCPServer()
            await server.initialize()

            try:
                tools = {tool.name: tool for tool in server.mcp.tools}
                execute_tool = tools["execute_workflow"]

                # Execute multiple workflows concurrently
                tasks = []
                for i in range(5):
                    task = execute_tool.func(
                        workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                        data={"analysisType": "photo", "concurrent_id": i},
                        correlation_id=f"concurrent_test_{i}"
                    )
                    tasks.append(task)

                # Wait for all to complete
                results = await asyncio.gather(*tasks, return_exceptions=True)

                # Verify all completed
                assert len(results) == 5
                for result in results:
                    if isinstance(result, Exception):
                        pytest.fail(f"Unexpected exception: {result}")
                    assert result is not None

            finally:
                await server.cleanup()

    @pytest.mark.integration
    @pytest.mark.asyncio
    async def test_server_lifecycle_integration(self):
        """Test complete server lifecycle including initialization and cleanup"""

        with patch('httpx.AsyncClient.get') as mock_get:
            mock_get.return_value = MagicMock(status_code=200)

            # Test server creation
            server = await create_server()
            assert server is not None
            assert server.n8n_client is not None
            assert server.workflow_manager is not None

            # Test server functionality
            tools = {tool.name: tool for tool in server.mcp.tools}
            assert len(tools) >= 15  # Should have all expected tools

            # Test health check
            health_tool = tools["health_check"]
            health_result = await health_tool.func()
            assert health_result is not None

            # Test cleanup
            await server.cleanup()

            # Verify cleanup completed without errors
"""
Tests for N8N Client functionality
"""

import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from datetime import datetime

from sanzo_n8n_mcp.n8n_client import N8NClient, N8NAPIError, N8NConnectionError
from sanzo_n8n_mcp.models import WorkflowType, WorkflowStatus, WorkflowHealthCheck


class TestN8NClient:
    """Test suite for N8NClient"""

    @pytest.fixture
    async def n8n_client(self):
        """Create N8N client for testing"""
        client = N8NClient(
            n8n_base_url="http://localhost:5678",
            webhook_base_url="http://localhost:5678/webhook",
            webhook_server_url="http://localhost:3003"
        )
        yield client
        await client.close()

    @pytest.mark.asyncio
    async def test_client_initialization(self):
        """Test N8N client initialization"""
        client = N8NClient(
            n8n_base_url="http://test:5678",
            api_key="test_key"
        )

        assert client.n8n_base_url == "http://test:5678"
        assert client.api_key == "test_key"
        assert "Authorization" in client.client.headers
        assert client.client.headers["Authorization"] == "Bearer test_key"

        await client.close()

    @pytest.mark.asyncio
    async def test_workflow_configurations(self, n8n_client):
        """Test workflow configurations are properly set"""
        configs = n8n_client.workflow_configs

        assert WorkflowType.CUSTOMER_ANALYSIS in configs
        assert WorkflowType.FOLLOW_UP_SEQUENCES in configs
        assert WorkflowType.CRM_LEAD_MANAGEMENT in configs
        assert WorkflowType.PHOTO_ANALYSIS_PROCESSING in configs

        # Test customer analysis config
        customer_config = configs[WorkflowType.CUSTOMER_ANALYSIS]
        assert customer_config.name == "Customer Analysis & Email Workflow"
        assert "customer-analysis-trigger" in customer_config.webhook_url
        assert "analysisType" in customer_config.expected_fields

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.post')
    async def test_trigger_workflow_success(self, mock_post, n8n_client):
        """Test successful workflow triggering"""
        # Mock successful response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "success": True,
            "workflowId": "test_workflow_123"
        }
        mock_post.return_value = mock_response

        # Test data
        test_data = {
            "analysisType": "photo",
            "roomType": "living_room",
            "customerEmail": "test@example.com"
        }

        # Execute workflow
        result = await n8n_client.trigger_workflow(
            WorkflowType.CUSTOMER_ANALYSIS,
            test_data,
            correlation_id="test_correlation"
        )

        # Assertions
        assert result.workflow_type == WorkflowType.CUSTOMER_ANALYSIS
        assert result.status == WorkflowStatus.COMPLETED
        assert result.correlation_id == "test_correlation"
        assert result.input_data["analysisType"] == "photo"
        assert result.n8n_execution_id == "test_workflow_123"
        assert result.duration_seconds is not None

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.post')
    async def test_trigger_workflow_failure(self, mock_post, n8n_client):
        """Test workflow triggering failure"""
        # Mock failure response
        mock_response = MagicMock()
        mock_response.status_code = 500
        mock_response.text = "Internal Server Error"
        mock_post.return_value = mock_response

        # Test data
        test_data = {"analysisType": "photo"}

        # Execute workflow
        result = await n8n_client.trigger_workflow(
            WorkflowType.CUSTOMER_ANALYSIS,
            test_data
        )

        # Assertions
        assert result.status == WorkflowStatus.FAILED
        assert "HTTP 500" in result.error_message
        assert result.completed_at is not None

    @pytest.mark.asyncio
    async def test_trigger_unknown_workflow(self, n8n_client):
        """Test triggering unknown workflow type"""
        # This would require modifying the enum, so we'll test the error handling
        with pytest.raises(N8NAPIError, match="Unknown workflow type"):
            # Create a mock workflow type that doesn't exist in configs
            n8n_client.workflow_configs.clear()
            await n8n_client.trigger_workflow(
                WorkflowType.CUSTOMER_ANALYSIS,
                {"test": "data"}
            )

    @pytest.mark.asyncio
    async def test_batch_trigger_workflows(self, n8n_client):
        """Test batch workflow triggering"""
        with patch.object(n8n_client, 'trigger_workflow') as mock_trigger:
            # Mock successful executions
            mock_execution = MagicMock()
            mock_execution.status = WorkflowStatus.COMPLETED
            mock_trigger.return_value = mock_execution

            # Test batch execution
            workflow_types = [
                WorkflowType.CUSTOMER_ANALYSIS,
                WorkflowType.CRM_LEAD_MANAGEMENT
            ]
            shared_data = {"source": "batch_test"}
            individual_data = {
                WorkflowType.CUSTOMER_ANALYSIS: {"analysisType": "photo"}
            }

            results = await n8n_client.batch_trigger_workflows(
                workflow_types=workflow_types,
                shared_data=shared_data,
                individual_data=individual_data,
                correlation_id="batch_test"
            )

            # Assertions
            assert len(results) == 2
            assert mock_trigger.call_count == 2

            # Check that shared data was included
            first_call = mock_trigger.call_args_list[0]
            assert first_call[1]['data']['source'] == "batch_test"
            assert first_call[1]['data']['batchId'] == "batch_test"

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.get')
    async def test_health_check_healthy(self, mock_get, n8n_client):
        """Test health check when all services are healthy"""
        # Mock successful responses for all endpoints
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_get.return_value = mock_response

        health = await n8n_client.health_check()

        assert isinstance(health, WorkflowHealthCheck)
        assert health.status == "healthy"
        assert health.n8n_connection is True
        assert health.webhook_server_status is True

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.get')
    async def test_health_check_degraded(self, mock_get, n8n_client):
        """Test health check when some services are down"""
        def mock_get_side_effect(url, **kwargs):
            response = MagicMock()
            if "n8n" in str(url):
                response.status_code = 200  # N8N is up
            else:
                response.status_code = 500  # Others are down
            return response

        mock_get.side_effect = mock_get_side_effect

        health = await n8n_client.health_check()

        assert health.status == "degraded"
        assert health.n8n_connection is True
        assert health.webhook_server_status is False

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.get')
    async def test_list_workflow_executions(self, mock_get, n8n_client):
        """Test listing workflow executions"""
        # Mock N8N API response
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "data": [
                {
                    "id": "execution_1",
                    "status": "success",
                    "data": {"test": "data"}
                }
            ]
        }
        mock_get.return_value = mock_response

        # Mock the conversion method
        with patch.object(n8n_client, '_convert_n8n_execution') as mock_convert:
            mock_execution = MagicMock()
            mock_convert.return_value = mock_execution

            executions = await n8n_client.list_workflow_executions(
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                limit=10
            )

            assert len(executions) == 1
            assert executions[0] == mock_execution

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.post')
    async def test_cancel_workflow_execution(self, mock_post, n8n_client):
        """Test cancelling workflow execution"""
        # Mock successful cancellation
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_post.return_value = mock_response

        result = await n8n_client.cancel_workflow_execution("test_execution_123")

        assert result is True
        mock_post.assert_called_once()

    @pytest.mark.asyncio
    async def test_get_workflow_metrics(self, n8n_client):
        """Test getting workflow metrics"""
        with patch.object(n8n_client, 'list_workflow_executions') as mock_list:
            # Mock executions with various statuses
            mock_executions = [
                MagicMock(status=WorkflowStatus.COMPLETED, duration_seconds=1.0),
                MagicMock(status=WorkflowStatus.COMPLETED, duration_seconds=2.0),
                MagicMock(status=WorkflowStatus.FAILED, duration_seconds=None),
            ]
            mock_list.return_value = mock_executions

            metrics = await n8n_client.get_workflow_metrics(WorkflowType.CUSTOMER_ANALYSIS)

            assert metrics["total_executions"] == 3
            assert metrics["successful_executions"] == 2
            assert metrics["failed_executions"] == 1
            assert metrics["average_duration"] == 1.5
            assert metrics["success_rate"] == pytest.approx(66.67, rel=1e-2)

    @pytest.mark.asyncio
    async def test_context_manager(self):
        """Test N8N client as async context manager"""
        async with N8NClient() as client:
            assert client is not None
            assert client.client is not None

        # Client should be closed after context
        # We can't easily test this without accessing private attributes

    @pytest.mark.asyncio
    async def test_client_close(self, n8n_client):
        """Test proper client cleanup"""
        # Should not raise any exceptions
        await n8n_client.close()

    @pytest.mark.asyncio
    @patch('httpx.AsyncClient.get')
    async def test_connection_error_handling(self, mock_get, n8n_client):
        """Test handling of connection errors"""
        # Mock connection error
        mock_get.side_effect = Exception("Connection failed")

        # Health check should handle the error gracefully
        health = await n8n_client.health_check()

        assert health.status == "unhealthy"
        assert health.n8n_connection is False
        assert health.webhook_server_status is False

    @pytest.mark.asyncio
    async def test_workflow_data_enrichment(self, n8n_client):
        """Test that workflow data is properly enriched with metadata"""
        with patch('httpx.AsyncClient.post') as mock_post:
            mock_response = MagicMock()
            mock_response.status_code = 200
            mock_response.json.return_value = {"success": True}
            mock_post.return_value = mock_response

            original_data = {"test": "value"}
            result = await n8n_client.trigger_workflow(
                WorkflowType.CUSTOMER_ANALYSIS,
                original_data,
                correlation_id="test_corr"
            )

            # Check that original data was preserved and metadata was added
            assert result.input_data["test"] == "value"
            assert result.input_data["source"] == "sanzo-n8n-mcp"
            assert result.input_data["workflowType"] == "customer-analysis"
            assert result.input_data["correlationId"] == "test_corr"
            assert "triggeredAt" in result.input_data
            assert "executionId" in result.input_data
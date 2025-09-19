"""
Sanzo N8N MCP Server - Main server implementation with workflow management tools
"""

import asyncio
import json
import os
import uuid
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from fastmcp import FastMCP
from pydantic import BaseModel, Field

from .models import (
    WorkflowType,
    WorkflowStatus,
    WorkflowInput,
    WorkflowExecution,
    WorkflowMetrics,
    WorkflowTriggerConfig,
    BatchWorkflowRequest,
    BatchWorkflowResult,
    WorkflowHealthCheck,
    SanzoAnalysisData,
    TriggerType
)
from .n8n_client import N8NClient
from .workflow_manager import WorkflowManager


class SanzoN8NMCPServer:
    """MCP Server for Sanzo Color Advisor N8N Integration"""

    def __init__(self):
        self.mcp = FastMCP("Sanzo N8N Workflow Integration")
        self.n8n_client: Optional[N8NClient] = None
        self.workflow_manager: Optional[WorkflowManager] = None
        self._setup_tools()

    async def initialize(self):
        """Initialize the MCP server and dependencies"""
        # Load configuration from environment
        n8n_base_url = os.getenv("N8N_BASE_URL", "http://localhost:5678")
        webhook_base_url = os.getenv("N8N_WEBHOOK_BASE_URL", "http://localhost:5678/webhook")
        webhook_server_url = os.getenv("WEBHOOK_SERVER_URL", "http://localhost:3003")
        n8n_api_key = os.getenv("N8N_API_KEY")

        # Initialize N8N client
        self.n8n_client = N8NClient(
            n8n_base_url=n8n_base_url,
            webhook_base_url=webhook_base_url,
            webhook_server_url=webhook_server_url,
            api_key=n8n_api_key
        )

        # Initialize workflow manager
        self.workflow_manager = WorkflowManager(self.n8n_client)
        await self.workflow_manager.start()

    async def cleanup(self):
        """Cleanup resources"""
        if self.workflow_manager:
            await self.workflow_manager.stop()
        if self.n8n_client:
            await self.n8n_client.close()

    def _setup_tools(self):
        """Setup all MCP tools for workflow management"""

        # Tool 1: Execute Single Workflow
        @self.mcp.tool("execute_workflow")
        async def execute_workflow(
            workflow_type: WorkflowType = Field(..., description="Type of workflow to execute"),
            data: Dict[str, Any] = Field(..., description="Input data for the workflow"),
            priority: int = Field(default=5, ge=1, le=10, description="Execution priority (1-10)"),
            correlation_id: Optional[str] = Field(None, description="Optional correlation ID for tracking"),
            timeout_seconds: Optional[int] = Field(None, description="Custom timeout in seconds")
        ) -> WorkflowExecution:
            """
            Execute a single N8N workflow with the provided data.

            This tool triggers the specified workflow type and returns the execution details
            including status, output data, and execution metrics.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            return await self.workflow_manager.execute_workflow(
                workflow_type=workflow_type,
                data=data,
                priority=priority,
                correlation_id=correlation_id,
                timeout_override=timeout_seconds
            )

        # Tool 2: Execute Batch Workflows
        @self.mcp.tool("execute_batch_workflows")
        async def execute_batch_workflows(
            workflows: List[WorkflowType] = Field(..., description="List of workflow types to execute"),
            shared_data: Dict[str, Any] = Field(default_factory=dict, description="Data shared across all workflows"),
            individual_data: Dict[str, Dict[str, Any]] = Field(
                default_factory=dict,
                description="Individual data per workflow (keyed by workflow type)"
            ),
            delay_between_workflows: int = Field(default=0, description="Delay between executions in milliseconds"),
            fail_fast: bool = Field(default=False, description="Stop batch on first failure"),
            correlation_id: Optional[str] = Field(None, description="Batch correlation ID")
        ) -> BatchWorkflowResult:
            """
            Execute multiple workflows as a batch operation.

            This tool allows orchestrating multiple workflows with shared and individual data,
            optional delays between executions, and fail-fast behavior.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            # Convert individual_data keys to WorkflowType enum
            individual_data_typed = {}
            for workflow_str, data in individual_data.items():
                try:
                    workflow_type = WorkflowType(workflow_str)
                    individual_data_typed[workflow_type] = data
                except ValueError:
                    continue

            batch_request = BatchWorkflowRequest(
                workflows=workflows,
                shared_data=shared_data,
                individual_data=individual_data_typed,
                delay_between_workflows=delay_between_workflows,
                fail_fast=fail_fast,
                correlation_id=correlation_id
            )

            return await self.workflow_manager.execute_batch_workflows(batch_request)

        # Tool 3: Get Workflow Status
        @self.mcp.tool("get_workflow_status")
        async def get_workflow_status(
            execution_id: str = Field(..., description="Workflow execution ID to check")
        ) -> Optional[WorkflowExecution]:
            """
            Get the current status and details of a workflow execution.

            Returns the execution details including status, duration, output data, and any errors.
            """
            if not self.n8n_client:
                raise RuntimeError("N8N client not initialized")

            return await self.n8n_client.get_workflow_execution(execution_id)

        # Tool 4: List Recent Executions
        @self.mcp.tool("list_workflow_executions")
        async def list_workflow_executions(
            workflow_type: Optional[WorkflowType] = Field(None, description="Filter by workflow type"),
            status: Optional[WorkflowStatus] = Field(None, description="Filter by execution status"),
            limit: int = Field(default=20, ge=1, le=100, description="Maximum number of results")
        ) -> List[WorkflowExecution]:
            """
            List recent workflow executions with optional filtering.

            Returns a list of workflow executions that can be filtered by type and status.
            """
            if not self.n8n_client:
                raise RuntimeError("N8N client not initialized")

            return await self.n8n_client.list_workflow_executions(
                workflow_type=workflow_type,
                status=status,
                limit=limit
            )

        # Tool 5: Get Workflow Metrics
        @self.mcp.tool("get_workflow_metrics")
        async def get_workflow_metrics(
            workflow_type: WorkflowType = Field(..., description="Workflow type to get metrics for")
        ) -> WorkflowMetrics:
            """
            Get comprehensive performance metrics for a specific workflow type.

            Returns metrics including total executions, success rate, average duration,
            and recent performance trends.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            return await self.workflow_manager.get_workflow_metrics(workflow_type)

        # Tool 6: Health Check
        @self.mcp.tool("health_check")
        async def health_check() -> WorkflowHealthCheck:
            """
            Perform a comprehensive health check of the N8N integration system.

            Checks connectivity to N8N, webhook server, and other dependent services.
            Returns overall system status and individual component health.
            """
            if not self.n8n_client:
                raise RuntimeError("N8N client not initialized")

            return await self.n8n_client.health_check()

        # Tool 7: Cancel Workflow
        @self.mcp.tool("cancel_workflow")
        async def cancel_workflow(
            execution_id: str = Field(..., description="Execution ID of workflow to cancel")
        ) -> bool:
            """
            Cancel a currently running workflow execution.

            Attempts to stop the workflow execution and returns success status.
            """
            if not self.n8n_client:
                raise RuntimeError("N8N client not initialized")

            return await self.n8n_client.cancel_workflow_execution(execution_id)

        # Tool 8: Quick Analysis Workflow
        @self.mcp.tool("trigger_customer_analysis")
        async def trigger_customer_analysis(
            analysis_type: str = Field(..., description="Type of analysis (photo, text, preferences)"),
            room_type: str = Field(..., description="Room type for analysis"),
            customer_email: Optional[str] = Field(None, description="Customer email address"),
            customer_name: Optional[str] = Field(None, description="Customer name"),
            age_group: Optional[str] = Field(None, description="Customer age group"),
            additional_data: Dict[str, Any] = Field(default_factory=dict, description="Additional analysis data")
        ) -> WorkflowExecution:
            """
            Quick trigger for customer analysis workflow with Sanzo color advisor.

            This is a convenience tool for triggering the most common workflow with
            proper data structure for color analysis.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            workflow_data = {
                "analysisType": analysis_type,
                "roomType": room_type,
                "customerEmail": customer_email,
                "customerName": customer_name,
                "ageGroup": age_group,
                **additional_data
            }

            return await self.workflow_manager.execute_workflow(
                workflow_type=WorkflowType.CUSTOMER_ANALYSIS,
                data=workflow_data,
                correlation_id=f"quick_analysis_{uuid.uuid4().hex[:8]}"
            )

        # Tool 9: Photo Analysis Processing
        @self.mcp.tool("trigger_photo_analysis_processing")
        async def trigger_photo_analysis_processing(
            extracted_colors: List[str] = Field(..., description="List of extracted color codes"),
            room_context: Dict[str, Any] = Field(..., description="Room context information"),
            recommendations: List[Dict[str, Any]] = Field(default_factory=list, description="Color recommendations"),
            confidence: float = Field(default=0.8, ge=0.0, le=1.0, description="Analysis confidence score"),
            metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")
        ) -> WorkflowExecution:
            """
            Trigger photo analysis processing workflow with extracted color data.

            This tool processes the results of photo analysis and generates
            appropriate follow-up actions and recommendations.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            workflow_data = {
                "extractedColors": extracted_colors,
                "roomContext": room_context,
                "recommendations": recommendations,
                "confidence": confidence,
                "metadata": metadata
            }

            return await self.workflow_manager.execute_workflow(
                workflow_type=WorkflowType.PHOTO_ANALYSIS_PROCESSING,
                data=workflow_data,
                correlation_id=f"photo_analysis_{uuid.uuid4().hex[:8]}"
            )

        # Tool 10: CRM Lead Management
        @self.mcp.tool("trigger_crm_lead_management")
        async def trigger_crm_lead_management(
            customer_name: str = Field(..., description="Customer name"),
            customer_email: str = Field(..., description="Customer email address"),
            analysis_data: Dict[str, Any] = Field(..., description="Analysis results data"),
            room_type: str = Field(..., description="Room type from analysis"),
            analysis_type: str = Field(..., description="Type of analysis performed"),
            customer_phone: Optional[str] = Field(None, description="Customer phone number"),
            lead_source: str = Field(default="sanzo-color-advisor", description="Source of the lead")
        ) -> WorkflowExecution:
            """
            Trigger CRM lead management workflow for customer data processing.

            This tool creates and manages leads in the CRM system based on
            customer analysis data and engagement.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            workflow_data = {
                "customerName": customer_name,
                "customerEmail": customer_email,
                "analysisData": analysis_data,
                "roomType": room_type,
                "analysisType": analysis_type,
                "customerPhone": customer_phone,
                "leadSource": lead_source
            }

            return await self.workflow_manager.execute_workflow(
                workflow_type=WorkflowType.CRM_LEAD_MANAGEMENT,
                data=workflow_data,
                correlation_id=f"crm_lead_{uuid.uuid4().hex[:8]}"
            )

        # Tool 11: Follow-up Sequences
        @self.mcp.tool("trigger_follow_up_sequences")
        async def trigger_follow_up_sequences(
            follow_up_type: str = Field(..., description="Type of follow-up (immediate, personal, targeted, basic)"),
            customer_data: Dict[str, Any] = Field(..., description="Customer information"),
            lead_score: int = Field(default=50, ge=0, le=100, description="Lead score (0-100)"),
            follow_up_action: str = Field(default="email", description="Type of follow-up action"),
            delay_hours: int = Field(default=24, description="Hours to delay before follow-up")
        ) -> WorkflowExecution:
            """
            Trigger automated follow-up sequences for customer engagement.

            This tool manages automated follow-up communications based on
            customer engagement level and analysis results.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            workflow_data = {
                "followUpType": follow_up_type,
                "customerData": customer_data,
                "leadScore": lead_score,
                "followUpAction": follow_up_action,
                "delayHours": delay_hours
            }

            return await self.workflow_manager.execute_workflow(
                workflow_type=WorkflowType.FOLLOW_UP_SEQUENCES,
                data=workflow_data,
                correlation_id=f"follow_up_{uuid.uuid4().hex[:8]}"
            )

        # Tool 12: Queue Management
        @self.mcp.tool("get_queue_status")
        async def get_queue_status() -> Dict[str, Any]:
            """
            Get current workflow queue status and execution statistics.

            Returns information about queue size, running workflows, and system capacity.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            return await self.workflow_manager.get_queue_status()

        # Tool 13: Add Automated Trigger
        @self.mcp.tool("add_automated_trigger")
        async def add_automated_trigger(
            trigger_name: str = Field(..., description="Unique name for the trigger"),
            workflow_type: WorkflowType = Field(..., description="Workflow to trigger"),
            trigger_conditions: Dict[str, Any] = Field(..., description="Conditions that activate the trigger"),
            trigger_schedule: Optional[str] = Field(None, description="Cron schedule for scheduled triggers"),
            enabled: bool = Field(default=True, description="Whether trigger is active"),
            max_executions_per_hour: int = Field(default=60, description="Rate limiting"),
            data_template: Dict[str, Any] = Field(default_factory=dict, description="Default data template")
        ) -> bool:
            """
            Add an automated workflow trigger configuration.

            This tool sets up automated triggers that can execute workflows based on
            schedules, events, or other conditions.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            trigger_config = WorkflowTriggerConfig(
                trigger_name=trigger_name,
                workflow_type=workflow_type,
                trigger_conditions=trigger_conditions,
                trigger_schedule=trigger_schedule,
                enabled=enabled,
                max_executions_per_hour=max_executions_per_hour,
                data_template=data_template
            )

            await self.workflow_manager.add_automated_trigger(trigger_config)
            return True

        # Tool 14: List Automated Triggers
        @self.mcp.tool("list_automated_triggers")
        async def list_automated_triggers() -> List[WorkflowTriggerConfig]:
            """
            List all configured automated workflow triggers.

            Returns all trigger configurations including their status and settings.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            return await self.workflow_manager.list_automated_triggers()

        # Tool 15: Remove Automated Trigger
        @self.mcp.tool("remove_automated_trigger")
        async def remove_automated_trigger(
            trigger_name: str = Field(..., description="Name of trigger to remove")
        ) -> bool:
            """
            Remove an automated workflow trigger.

            Stops and removes the specified automated trigger configuration.
            """
            if not self.workflow_manager:
                raise RuntimeError("Workflow manager not initialized")

            return await self.workflow_manager.remove_automated_trigger(trigger_name)

    def get_server(self) -> FastMCP:
        """Get the MCP server instance"""
        return self.mcp


# Server instance for external use
async def create_server() -> SanzoN8NMCPServer:
    """Create and initialize the MCP server"""
    server = SanzoN8NMCPServer()
    await server.initialize()
    return server


# CLI entry point
async def main():
    """Main entry point for running the MCP server"""
    import sys
    import signal

    server = await create_server()

    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        print(f"\nReceived signal {signum}, shutting down...")
        asyncio.create_task(server.cleanup())
        sys.exit(0)

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    try:
        print("🚀 Sanzo N8N MCP Server starting...")
        print("🔗 Available tools:")
        print("   • execute_workflow - Execute single workflow")
        print("   • execute_batch_workflows - Execute multiple workflows")
        print("   • get_workflow_status - Check execution status")
        print("   • list_workflow_executions - List recent executions")
        print("   • get_workflow_metrics - Get performance metrics")
        print("   • health_check - System health check")
        print("   • cancel_workflow - Cancel running workflow")
        print("   • trigger_customer_analysis - Quick customer analysis")
        print("   • trigger_photo_analysis_processing - Process photo analysis")
        print("   • trigger_crm_lead_management - Manage CRM leads")
        print("   • trigger_follow_up_sequences - Automated follow-ups")
        print("   • get_queue_status - Queue management")
        print("   • add_automated_trigger - Configure automation")
        print("   • list_automated_triggers - List automations")
        print("   • remove_automated_trigger - Remove automation")
        print("✅ Server ready for MCP connections")

        # Run the server
        await server.get_server().run()

    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
    finally:
        await server.cleanup()
        print("🔄 Server cleanup completed")


if __name__ == "__main__":
    asyncio.run(main())
"""
Pydantic models for Sanzo N8N MCP integration
"""

from datetime import datetime
from enum import Enum
from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field, validator


class WorkflowType(str, Enum):
    """Supported N8N workflow types"""
    CUSTOMER_ANALYSIS = "customer-analysis"
    FOLLOW_UP_SEQUENCES = "follow-up-sequences"
    CRM_LEAD_MANAGEMENT = "crm-lead-management"
    PHOTO_ANALYSIS_PROCESSING = "photo-analysis-processing"


class WorkflowStatus(str, Enum):
    """Workflow execution status"""
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    TIMEOUT = "timeout"


class TriggerType(str, Enum):
    """Workflow trigger types"""
    MANUAL = "manual"
    WEBHOOK = "webhook"
    SCHEDULED = "scheduled"
    EVENT_DRIVEN = "event_driven"
    BATCH = "batch"


class WorkflowConfiguration(BaseModel):
    """N8N workflow configuration"""
    name: str = Field(..., description="Workflow name")
    workflow_type: WorkflowType = Field(..., description="Type of workflow")
    webhook_url: str = Field(..., description="N8N webhook URL")
    description: str = Field(..., description="Workflow description")
    expected_fields: List[str] = Field(default_factory=list, description="Expected input fields")
    timeout_seconds: int = Field(default=300, description="Execution timeout in seconds")
    retry_attempts: int = Field(default=3, description="Number of retry attempts")
    enabled: bool = Field(default=True, description="Whether workflow is enabled")


class WorkflowInput(BaseModel):
    """Input data for workflow execution"""
    workflow_type: WorkflowType = Field(..., description="Type of workflow to execute")
    data: Dict[str, Any] = Field(..., description="Workflow input data")
    trigger_type: TriggerType = Field(default=TriggerType.MANUAL, description="How workflow was triggered")
    correlation_id: Optional[str] = Field(None, description="Optional correlation ID for tracking")
    priority: int = Field(default=5, ge=1, le=10, description="Execution priority (1-10)")
    timeout_override: Optional[int] = Field(None, description="Override default timeout")


class WorkflowExecution(BaseModel):
    """Workflow execution tracking"""
    execution_id: str = Field(..., description="Unique execution ID")
    workflow_type: WorkflowType = Field(..., description="Type of workflow")
    status: WorkflowStatus = Field(..., description="Current execution status")
    input_data: Dict[str, Any] = Field(..., description="Input data used")
    output_data: Optional[Dict[str, Any]] = Field(None, description="Output data generated")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    started_at: datetime = Field(..., description="Execution start time")
    completed_at: Optional[datetime] = Field(None, description="Execution completion time")
    duration_seconds: Optional[float] = Field(None, description="Execution duration")
    n8n_execution_id: Optional[str] = Field(None, description="N8N internal execution ID")
    correlation_id: Optional[str] = Field(None, description="Correlation ID for tracking")
    retry_count: int = Field(default=0, description="Number of retries performed")


class WorkflowMetrics(BaseModel):
    """Workflow execution metrics"""
    workflow_type: WorkflowType = Field(..., description="Type of workflow")
    total_executions: int = Field(default=0, description="Total number of executions")
    successful_executions: int = Field(default=0, description="Number of successful executions")
    failed_executions: int = Field(default=0, description="Number of failed executions")
    average_duration_seconds: float = Field(default=0.0, description="Average execution duration")
    success_rate: float = Field(default=0.0, description="Success rate percentage")
    last_execution: Optional[datetime] = Field(None, description="Last execution timestamp")


class BatchWorkflowRequest(BaseModel):
    """Batch workflow execution request"""
    workflows: List[WorkflowType] = Field(..., description="List of workflows to execute")
    shared_data: Dict[str, Any] = Field(default_factory=dict, description="Shared data for all workflows")
    individual_data: Dict[WorkflowType, Dict[str, Any]] = Field(
        default_factory=dict,
        description="Individual data per workflow"
    )
    delay_between_workflows: int = Field(default=0, description="Delay between workflow executions (ms)")
    fail_fast: bool = Field(default=False, description="Stop batch on first failure")
    correlation_id: Optional[str] = Field(None, description="Batch correlation ID")


class BatchWorkflowResult(BaseModel):
    """Batch workflow execution result"""
    batch_id: str = Field(..., description="Unique batch ID")
    total_workflows: int = Field(..., description="Total number of workflows in batch")
    successful_workflows: int = Field(..., description="Number of successful workflows")
    failed_workflows: int = Field(..., description="Number of failed workflows")
    execution_results: List[WorkflowExecution] = Field(..., description="Individual execution results")
    started_at: datetime = Field(..., description="Batch start time")
    completed_at: Optional[datetime] = Field(None, description="Batch completion time")
    total_duration_seconds: Optional[float] = Field(None, description="Total batch duration")


class WorkflowTriggerConfig(BaseModel):
    """Configuration for automated workflow triggers"""
    trigger_name: str = Field(..., description="Unique trigger name")
    workflow_type: WorkflowType = Field(..., description="Workflow to trigger")
    trigger_conditions: Dict[str, Any] = Field(..., description="Conditions that activate trigger")
    trigger_schedule: Optional[str] = Field(None, description="Cron schedule for scheduled triggers")
    enabled: bool = Field(default=True, description="Whether trigger is active")
    max_executions_per_hour: int = Field(default=60, description="Rate limiting")
    data_template: Dict[str, Any] = Field(default_factory=dict, description="Default data template")


class SanzoAnalysisData(BaseModel):
    """Sanzo Color Advisor analysis data structure"""
    analysis_type: str = Field(..., description="Type of analysis performed")
    room_type: str = Field(..., description="Room type analyzed")
    customer_email: Optional[str] = Field(None, description="Customer email")
    customer_name: Optional[str] = Field(None, description="Customer name")
    extracted_colors: Optional[List[str]] = Field(None, description="Colors extracted from photo")
    recommendations: Optional[List[Dict[str, Any]]] = Field(None, description="Color recommendations")
    confidence: Optional[float] = Field(None, ge=0.0, le=1.0, description="Analysis confidence score")
    metadata: Optional[Dict[str, Any]] = Field(None, description="Additional analysis metadata")


class WorkflowHealthCheck(BaseModel):
    """Health check result for workflow system"""
    status: str = Field(..., description="Overall system status")
    n8n_connection: bool = Field(..., description="N8N connectivity status")
    webhook_server_status: bool = Field(..., description="Webhook server status")
    active_workflows: int = Field(..., description="Number of active workflow executions")
    queue_size: int = Field(..., description="Number of workflows in queue")
    last_health_check: datetime = Field(..., description="Last health check timestamp")
    service_endpoints: Dict[str, bool] = Field(..., description="Status of external service endpoints")


class WorkflowAnalytics(BaseModel):
    """Analytics data for workflow performance"""
    time_period: str = Field(..., description="Time period for analytics")
    total_executions: int = Field(..., description="Total executions in period")
    execution_trends: Dict[str, int] = Field(..., description="Execution trends by workflow type")
    performance_metrics: Dict[str, float] = Field(..., description="Performance metrics")
    error_patterns: Dict[str, int] = Field(..., description="Common error patterns")
    peak_usage_hours: List[int] = Field(..., description="Peak usage hours")
    recommendations: List[str] = Field(..., description="Performance recommendations")


class WebhookEvent(BaseModel):
    """Webhook event data"""
    event_id: str = Field(..., description="Unique event ID")
    event_type: str = Field(..., description="Type of webhook event")
    source: str = Field(..., description="Source of the event")
    timestamp: datetime = Field(..., description="Event timestamp")
    payload: Dict[str, Any] = Field(..., description="Event payload data")
    processed: bool = Field(default=False, description="Whether event has been processed")


# Field validators for Pydantic V2
from pydantic import field_validator

# Note: This validator would typically be applied to the WorkflowMetrics model
# but is defined here as a utility function due to model structure


# Export all models
__all__ = [
    "WorkflowType",
    "WorkflowStatus",
    "TriggerType",
    "WorkflowConfiguration",
    "WorkflowInput",
    "WorkflowExecution",
    "WorkflowMetrics",
    "BatchWorkflowRequest",
    "BatchWorkflowResult",
    "WorkflowTriggerConfig",
    "SanzoAnalysisData",
    "WorkflowHealthCheck",
    "WorkflowAnalytics",
    "WebhookEvent"
]
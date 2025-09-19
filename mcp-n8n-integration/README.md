# Sanzo N8N MCP Integration

A comprehensive Model Context Protocol (MCP) server for integrating N8N workflow automation with the Sanzo Color Advisor application. This server provides 15 specialized tools for managing, executing, and monitoring N8N workflows through MCP clients like Claude Desktop.

## 🚀 Features

### Core Workflow Management
- **Single Workflow Execution** - Execute individual workflows with full tracking
- **Batch Workflow Processing** - Execute multiple workflows with shared/individual data
- **Workflow Status Monitoring** - Real-time status tracking and execution details
- **Queue Management** - Intelligent workflow queuing with concurrency controls

### Automation & Triggers
- **Automated Triggers** - Configure event-driven and scheduled workflow execution
- **Trigger Management** - Add, list, and remove automated workflow triggers
- **Rate Limiting** - Built-in rate limiting to prevent system overload

### Analytics & Monitoring
- **Performance Metrics** - Comprehensive workflow performance analytics
- **Health Monitoring** - System health checks for all integrated services
- **Execution Analytics** - Success rates, duration tracking, error analysis

### Sanzo-Specific Tools
- **Customer Analysis Workflows** - Specialized tools for color analysis workflows
- **Photo Analysis Processing** - Automated photo color extraction and processing
- **CRM Lead Management** - Customer relationship management integration
- **Follow-up Sequences** - Automated customer engagement workflows

## 📦 Installation

### Prerequisites
- Python 3.11+
- N8N instance running on localhost:5678 (or configured URL)
- Sanzo Color Advisor webhook server on localhost:3003

### Install via pip
```bash
pip install -r requirements.txt
```

### Install for development
```bash
pip install -e .
pip install -r requirements.txt[dev]
```

## ⚙️ Configuration

### Environment Variables
Create a `.env` file based on `.env.example`:

```bash
# N8N Configuration
N8N_BASE_URL=http://localhost:5678
N8N_API_KEY=your_n8n_api_key_here
N8N_WEBHOOK_BASE_URL=http://localhost:5678/webhook

# Webhook Server Configuration
WEBHOOK_SERVER_URL=http://localhost:3003
WEBHOOK_SERVER_ENABLED=true

# Sanzo Color Advisor Integration
SANZO_API_URL=http://localhost:3000
SANZO_PHOTO_ANALYSIS_URL=http://localhost:3002

# MCP Server Configuration
MCP_SERVER_NAME=sanzo-n8n-mcp
MCP_DEBUG_MODE=false
MCP_LOG_LEVEL=INFO

# Workflow Management
WORKFLOW_TIMEOUT_SECONDS=300
WORKFLOW_RETRY_ATTEMPTS=3
MAX_CONCURRENT_WORKFLOWS=5
```

### N8N Workflow Setup
Ensure your N8N instance has the following workflows configured:
1. **Customer Analysis Workflow** - `/webhook/customer-analysis-trigger`
2. **Follow-up Sequences** - `/webhook/follow-up-trigger`
3. **CRM Lead Management** - `/webhook/crm-lead-trigger`
4. **Photo Analysis Processing** - `/webhook/photo-analysis-processing`

## 🏃 Running the Server

### Standalone Mode
```bash
python -m sanzo_n8n_mcp.server
```

### Claude Desktop Integration
Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "sanzo-n8n": {
      "command": "python",
      "args": ["-m", "sanzo_n8n_mcp.server"],
      "env": {
        "N8N_BASE_URL": "http://localhost:5678",
        "WEBHOOK_SERVER_URL": "http://localhost:3003"
      }
    }
  }
}
```

### Using uv (recommended)
```bash
uvx sanzo-n8n-mcp
```

## 🔧 Available MCP Tools

### Core Workflow Tools

#### `execute_workflow`
Execute a single N8N workflow with tracking.

**Parameters:**
- `workflow_type`: Type of workflow (customer-analysis, follow-up-sequences, etc.)
- `data`: Input data for the workflow
- `priority`: Execution priority (1-10)
- `correlation_id`: Optional tracking ID
- `timeout_seconds`: Custom timeout

**Example:**
```python
result = await execute_workflow(
    workflow_type="customer-analysis",
    data={
        "analysisType": "photo",
        "roomType": "living_room",
        "customerEmail": "customer@example.com"
    },
    correlation_id="analysis_001"
)
```

#### `execute_batch_workflows`
Execute multiple workflows as a batch operation.

**Parameters:**
- `workflows`: List of workflow types to execute
- `shared_data`: Data shared across all workflows
- `individual_data`: Workflow-specific data
- `delay_between_workflows`: Delay in milliseconds
- `fail_fast`: Stop on first failure

#### `get_workflow_status`
Get current status of a workflow execution.

**Parameters:**
- `execution_id`: Workflow execution ID

#### `list_workflow_executions`
List recent workflow executions with filtering.

**Parameters:**
- `workflow_type`: Filter by workflow type
- `status`: Filter by execution status
- `limit`: Maximum results (1-100)

### Monitoring & Analytics Tools

#### `get_workflow_metrics`
Get comprehensive performance metrics.

**Parameters:**
- `workflow_type`: Workflow type to analyze

**Returns:**
- Total executions
- Success rate
- Average duration
- Error patterns

#### `health_check`
Perform system-wide health check.

**Returns:**
- N8N connectivity status
- Webhook server status
- Service endpoint health
- Queue status

#### `get_queue_status`
Get current workflow queue statistics.

**Returns:**
- Queue size
- Running workflows
- Completed workflows
- System capacity

### Automation Tools

#### `add_automated_trigger`
Configure automated workflow triggers.

**Parameters:**
- `trigger_name`: Unique trigger identifier
- `workflow_type`: Workflow to trigger
- `trigger_conditions`: Activation conditions
- `trigger_schedule`: Cron schedule (optional)
- `max_executions_per_hour`: Rate limiting

#### `list_automated_triggers`
List all configured automated triggers.

#### `remove_automated_trigger`
Remove an automated trigger.

**Parameters:**
- `trigger_name`: Trigger to remove

### Convenience Tools

#### `trigger_customer_analysis`
Quick trigger for customer analysis workflows.

**Parameters:**
- `analysis_type`: Type of analysis (photo, text, preferences)
- `room_type`: Room type for analysis
- `customer_email`: Customer email (optional)
- `customer_name`: Customer name (optional)
- `additional_data`: Extra analysis data

#### `trigger_photo_analysis_processing`
Process photo analysis results.

**Parameters:**
- `extracted_colors`: List of color codes
- `room_context`: Room information
- `recommendations`: Color recommendations
- `confidence`: Analysis confidence (0-1)

#### `trigger_crm_lead_management`
Manage CRM leads from analysis data.

**Parameters:**
- `customer_name`: Customer name
- `customer_email`: Customer email
- `analysis_data`: Analysis results
- `room_type`: Room type
- `analysis_type`: Analysis type

#### `trigger_follow_up_sequences`
Configure automated follow-up communications.

**Parameters:**
- `follow_up_type`: Type (immediate, personal, targeted, basic)
- `customer_data`: Customer information
- `lead_score`: Lead score (0-100)
- `follow_up_action`: Action type

#### `cancel_workflow`
Cancel a running workflow execution.

**Parameters:**
- `execution_id`: Execution to cancel

## 🧪 Testing

### Run All Tests
```bash
pytest
```

### Run Specific Test Categories
```bash
# Unit tests only
pytest tests/test_n8n_client.py tests/test_workflow_manager.py tests/test_mcp_server.py

# Integration tests only
pytest tests/test_integration.py -m integration

# N8N-specific tests
pytest -m n8n
```

### Test Coverage
```bash
pytest --cov=sanzo_n8n_mcp --cov-report=html
```

## 📊 Workflow Types

### Customer Analysis (`customer-analysis`)
Analyzes customer preferences and room requirements for color recommendations.

**Expected Fields:**
- `analysisType`: photo, text, preferences
- `roomType`: living_room, bedroom, kitchen, etc.
- `customerEmail`: Contact information
- `customerName`: Customer identifier
- `ageGroup`: Demographic information

### Follow-up Sequences (`follow-up-sequences`)
Manages automated customer follow-up communications.

**Expected Fields:**
- `followUpType`: immediate, personal, targeted, basic
- `customerData`: Customer contact information
- `leadScore`: Engagement score (0-100)
- `followUpAction`: email, sms, call

### CRM Lead Management (`crm-lead-management`)
Processes customer data and creates CRM entries.

**Expected Fields:**
- `customerName`: Customer name
- `customerEmail`: Contact email
- `analysisData`: Color analysis results
- `roomType`: Room context
- `analysisType`: Analysis method used

### Photo Analysis Processing (`photo-analysis-processing`)
Processes extracted colors from photo analysis.

**Expected Fields:**
- `extractedColors`: Array of color codes
- `roomContext`: Room information
- `recommendations`: Color suggestions
- `metadata`: Analysis metadata

## 🔍 Monitoring & Debugging

### Enable Debug Mode
```bash
export MCP_DEBUG_MODE=true
export MCP_LOG_LEVEL=DEBUG
```

### Workflow Execution Tracking
All workflows are tracked with:
- Unique execution IDs
- Correlation IDs for grouping
- Start/completion timestamps
- Duration metrics
- Success/failure status
- Error messages

### Health Check Endpoints
The system monitors:
- N8N API connectivity
- Webhook server status
- Sanzo API availability
- Photo analysis service
- Queue status and capacity

## 🚨 Error Handling

### Common Error Scenarios
1. **N8N Service Unavailable** - Graceful degradation with error reporting
2. **Webhook Server Down** - Automatic retry with backoff
3. **Queue Full** - Request rejection with clear error messages
4. **Timeout Errors** - Configurable timeouts with cleanup
5. **Invalid Workflow Data** - Validation errors with field-specific messages

### Error Recovery
- Automatic retry for transient failures
- Circuit breaker for repeated failures
- Graceful degradation when services are unavailable
- Comprehensive error logging and reporting

## 🔧 Advanced Configuration

### Custom Timeouts
```python
# Per-workflow timeout override
result = await execute_workflow(
    workflow_type="customer-analysis",
    data=workflow_data,
    timeout_seconds=600  # 10 minutes
)
```

### Batch Processing with Delays
```python
# Staggered batch execution
result = await execute_batch_workflows(
    workflows=["customer-analysis", "crm-lead-management"],
    shared_data={"source": "batch_import"},
    delay_between_workflows=5000  # 5 second delay
)
```

### Rate Limiting Configuration
```python
# Configure automated trigger rate limits
await add_automated_trigger(
    trigger_name="hourly_analysis",
    workflow_type="customer-analysis",
    trigger_conditions={"schedule": "hourly"},
    max_executions_per_hour=60
)
```

## 📈 Performance Optimization

### Queue Management
- Maximum 1000 queued workflows
- Configurable concurrency limits (default: 5 concurrent)
- Priority-based execution ordering
- Automatic queue cleanup

### Memory Management
- Automatic cleanup of old execution records
- Configurable retention periods
- Efficient metrics storage with pruning
- Connection pooling for HTTP clients

### Monitoring Recommendations
- Monitor queue size and running workflows
- Track success rates and error patterns
- Set up alerts for service health issues
- Regular cleanup of old execution data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

### Development Setup
```bash
git clone <repository>
cd sanzo-n8n-mcp-integration
pip install -e .[dev]
pre-commit install
```

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Related Projects

- [Sanzo Color Advisor](../README.md) - Main color advisor application
- [N8N Workflows](../workflows/) - N8N workflow definitions
- [FastMCP](https://github.com/jlowin/fastmcp) - MCP server framework

## 📞 Support

For issues and questions:
1. Check the health check endpoint: `health_check()`
2. Review logs in debug mode
3. Verify N8N and webhook server connectivity
4. Check workflow configuration in N8N

## 🔄 Version History

### v1.0.0
- Initial release with 15 MCP tools
- Complete N8N workflow integration
- Automated trigger system
- Comprehensive testing suite
- Production-ready error handling
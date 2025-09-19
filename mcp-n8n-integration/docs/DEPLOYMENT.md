# Deployment Guide

This guide covers various deployment scenarios for the Sanzo N8N MCP Integration server.

## 🏠 Local Development

### Prerequisites
- Python 3.11+
- N8N instance (local or remote)
- Sanzo Color Advisor webhook server

### Quick Start
```bash
# Clone and setup
git clone <repository>
cd sanzo-n8n-mcp-integration

# Run quick start script
chmod +x scripts/quick-start.sh
./scripts/quick-start.sh

# Or on Windows
scripts\quick-start.bat
```

### Manual Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Run the server
python -m sanzo_n8n_mcp.server
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  sanzo-n8n-mcp:
    build: .
    ports:
      - "8080:8080"
    environment:
      - N8N_BASE_URL=http://n8n:5678
      - WEBHOOK_SERVER_URL=http://webhook-server:3003
      - MCP_LOG_LEVEL=INFO
    depends_on:
      - n8n
      - webhook-server
    networks:
      - sanzo-network

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - sanzo-network

  webhook-server:
    image: sanzo/webhook-server
    ports:
      - "3003:3003"
    networks:
      - sanzo-network

volumes:
  n8n_data:

networks:
  sanzo-network:
    driver: bridge
```

### Standalone Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Install the package
RUN pip install -e .

# Create non-root user
RUN useradd --create-home --shell /bin/bash mcp
USER mcp

# Expose port (if running HTTP mode)
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import asyncio; from sanzo_n8n_mcp.n8n_client import N8NClient; \
    async def check(): \
        async with N8NClient() as client: \
            health = await client.health_check(); \
            exit(0 if health.status == 'healthy' else 1); \
    asyncio.run(check())" || exit 1

# Default command
CMD ["python", "-m", "sanzo_n8n_mcp.server"]
```

Build and run:
```bash
docker build -t sanzo-n8n-mcp .
docker run -p 8080:8080 --env-file .env sanzo-n8n-mcp
```

## ☁️ Cloud Deployment

### AWS ECS

1. **Create ECR Repository**
```bash
aws ecr create-repository --repository-name sanzo-n8n-mcp
```

2. **Build and Push Image**
```bash
# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789012.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t sanzo-n8n-mcp .
docker tag sanzo-n8n-mcp:latest 123456789012.dkr.ecr.us-east-1.amazonaws.com/sanzo-n8n-mcp:latest

# Push
docker push 123456789012.dkr.ecr.us-east-1.amazonaws.com/sanzo-n8n-mcp:latest
```

3. **ECS Task Definition**
```json
{
  "family": "sanzo-n8n-mcp",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "sanzo-n8n-mcp",
      "image": "123456789012.dkr.ecr.us-east-1.amazonaws.com/sanzo-n8n-mcp:latest",
      "portMappings": [
        {
          "containerPort": 8080,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "N8N_BASE_URL",
          "value": "https://your-n8n-instance.com"
        },
        {
          "name": "MCP_LOG_LEVEL",
          "value": "INFO"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sanzo-n8n-mcp",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

1. **Build and Deploy**
```bash
# Build for Cloud Run
gcloud builds submit --tag gcr.io/your-project/sanzo-n8n-mcp

# Deploy
gcloud run deploy sanzo-n8n-mcp \
  --image gcr.io/your-project/sanzo-n8n-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars N8N_BASE_URL=https://your-n8n-instance.com,MCP_LOG_LEVEL=INFO
```

### Azure Container Instances

```bash
# Create resource group
az group create --name sanzo-mcp-rg --location eastus

# Deploy container
az container create \
  --resource-group sanzo-mcp-rg \
  --name sanzo-n8n-mcp \
  --image your-registry/sanzo-n8n-mcp:latest \
  --ports 8080 \
  --environment-variables \
    N8N_BASE_URL=https://your-n8n-instance.com \
    MCP_LOG_LEVEL=INFO \
  --restart-policy Always
```

## 🎛️ Configuration Management

### Environment Variables by Deployment Type

#### Development
```bash
N8N_BASE_URL=http://localhost:5678
WEBHOOK_SERVER_URL=http://localhost:3003
MCP_DEBUG_MODE=true
MCP_LOG_LEVEL=DEBUG
```

#### Staging
```bash
N8N_BASE_URL=https://staging-n8n.company.com
WEBHOOK_SERVER_URL=https://staging-webhooks.company.com
MCP_LOG_LEVEL=INFO
ENABLE_WORKFLOW_MONITORING=true
WORKFLOW_TIMEOUT_SECONDS=600
```

#### Production
```bash
N8N_BASE_URL=https://n8n.company.com
N8N_API_KEY=${N8N_API_KEY_SECRET}
WEBHOOK_SERVER_URL=https://webhooks.company.com
MCP_LOG_LEVEL=WARNING
ENABLE_WORKFLOW_MONITORING=true
ANALYTICS_RETENTION_DAYS=30
MAX_CONCURRENT_WORKFLOWS=10
```

### Secrets Management

#### AWS Secrets Manager
```python
import boto3
import json

def get_secret(secret_name):
    client = boto3.client('secretsmanager', region_name='us-east-1')
    response = client.get_secret_value(SecretId=secret_name)
    return json.loads(response['SecretString'])

# Usage in production
secrets = get_secret('sanzo-mcp/prod')
os.environ['N8N_API_KEY'] = secrets['n8n_api_key']
```

#### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: sanzo-mcp-secrets
type: Opaque
data:
  n8n-api-key: <base64-encoded-key>
  webhook-secret: <base64-encoded-secret>
```

## 📊 Monitoring & Logging

### Health Checks

The server provides built-in health checks:
```bash
# Using MCP tool
health_check()

# HTTP endpoint (if HTTP mode enabled)
curl http://localhost:8080/health
```

### Logging Configuration

#### Structured Logging
```python
import structlog

logger = structlog.get_logger("sanzo.mcp")
logger.info("Workflow executed",
           workflow_type="customer-analysis",
           execution_id="exec_123",
           duration=1.5)
```

#### Log Levels by Environment
- **Development**: DEBUG - Full request/response logging
- **Staging**: INFO - Workflow execution details
- **Production**: WARNING - Errors and important events only

### Metrics Collection

#### Prometheus Metrics
```python
from prometheus_client import Counter, Histogram, Gauge

# Workflow execution metrics
workflow_executions = Counter('workflow_executions_total',
                            'Total workflow executions',
                            ['workflow_type', 'status'])

workflow_duration = Histogram('workflow_duration_seconds',
                             'Workflow execution duration',
                             ['workflow_type'])

active_workflows = Gauge('active_workflows',
                        'Currently active workflows')
```

#### CloudWatch Metrics (AWS)
```python
import boto3

cloudwatch = boto3.client('cloudwatch')

def send_metric(metric_name, value, unit='Count'):
    cloudwatch.put_metric_data(
        Namespace='SanzoMCP',
        MetricData=[
            {
                'MetricName': metric_name,
                'Value': value,
                'Unit': unit,
                'Dimensions': [
                    {
                        'Name': 'Environment',
                        'Value': os.environ.get('ENVIRONMENT', 'dev')
                    }
                ]
            }
        ]
    )
```

## 🔒 Security

### Network Security

#### Firewall Rules
```bash
# Allow only necessary ports
ufw allow 22/tcp   # SSH
ufw allow 8080/tcp # MCP server
ufw deny 5678/tcp  # Block direct N8N access
```

#### Load Balancer Configuration
```nginx
upstream sanzo_mcp {
    server mcp1:8080 max_fails=3 fail_timeout=30s;
    server mcp2:8080 max_fails=3 fail_timeout=30s;
}

server {
    listen 443 ssl;
    server_name mcp.company.com;

    ssl_certificate /etc/ssl/certs/company.crt;
    ssl_certificate_key /etc/ssl/private/company.key;

    location / {
        proxy_pass http://sanzo_mcp;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Authentication & Authorization

#### API Key Authentication
```python
# In production, use strong API keys
N8N_API_KEY = os.environ.get('N8N_API_KEY')
WEBHOOK_SECRET_KEY = os.environ.get('WEBHOOK_SECRET_KEY')
```

#### Rate Limiting
```python
from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@limiter.limit("100/minute")
async def execute_workflow(request: Request, ...):
    pass
```

## 🚀 Performance Optimization

### Scaling Strategies

#### Horizontal Scaling
```bash
# Run multiple instances
docker run -p 8080:8080 --name mcp1 sanzo-n8n-mcp
docker run -p 8081:8080 --name mcp2 sanzo-n8n-mcp
docker run -p 8082:8080 --name mcp3 sanzo-n8n-mcp
```

#### Kubernetes Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sanzo-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sanzo-mcp
  template:
    metadata:
      labels:
        app: sanzo-mcp
    spec:
      containers:
      - name: sanzo-mcp
        image: sanzo-n8n-mcp:latest
        ports:
        - containerPort: 8080
        env:
        - name: MAX_CONCURRENT_WORKFLOWS
          value: "5"
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### Caching Strategies

#### Redis Cache
```python
import redis

cache = redis.Redis(host='redis', port=6379, db=0)

def cache_workflow_result(execution_id, result):
    cache.setex(f"workflow:{execution_id}", 3600, json.dumps(result))

def get_cached_result(execution_id):
    cached = cache.get(f"workflow:{execution_id}")
    return json.loads(cached) if cached else None
```

## 🔧 Troubleshooting

### Common Issues

#### Connection Errors
```bash
# Check N8N connectivity
curl -f http://localhost:5678/api/v1/workflows

# Check webhook server
curl -f http://localhost:3003/api/health

# Check MCP server logs
docker logs sanzo-n8n-mcp
```

#### Memory Issues
```bash
# Monitor memory usage
docker stats sanzo-n8n-mcp

# Increase container memory
docker run -m 1g sanzo-n8n-mcp
```

#### Performance Issues
```bash
# Check queue status
# Use get_queue_status() MCP tool

# Monitor workflow metrics
# Use get_workflow_metrics() MCP tool

# Check system resources
htop
```

### Debugging

#### Enable Debug Mode
```bash
export MCP_DEBUG_MODE=true
export MCP_LOG_LEVEL=DEBUG
python -m sanzo_n8n_mcp.server
```

#### Debug Specific Workflows
```python
# Add detailed logging to specific workflow types
logger.debug("Executing customer analysis",
            data=workflow_data,
            correlation_id=correlation_id)
```

## 📋 Maintenance

### Regular Tasks

#### Daily
- Monitor error rates and queue sizes
- Check health check status
- Review performance metrics

#### Weekly
- Clean up old execution records
- Update dependencies (security patches)
- Review and rotate logs

#### Monthly
- Performance analysis and optimization
- Capacity planning review
- Security audit

### Backup Procedures

#### Configuration Backup
```bash
# Backup environment configurations
tar -czf config-backup-$(date +%Y%m%d).tar.gz .env* *.json *.yaml

# Backup workflow definitions
curl -H "Authorization: Bearer $N8N_API_KEY" \
     "$N8N_BASE_URL/api/v1/workflows" > workflows-backup-$(date +%Y%m%d).json
```

#### Metrics Backup
```bash
# Export metrics data
python -c "
from sanzo_n8n_mcp.workflow_manager import WorkflowManager
import json
# Export metrics to file
"
```

This deployment guide provides comprehensive coverage for deploying the Sanzo N8N MCP Integration in various environments with proper security, monitoring, and maintenance procedures.
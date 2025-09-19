#!/bin/bash

# Sanzo N8N MCP Integration - Quick Start Script
# This script sets up and runs the MCP server with proper configuration

set -e

echo "🚀 Sanzo N8N MCP Integration - Quick Start"
echo "=========================================="

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}' | cut -d. -f1,2)
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo "❌ Error: Python 3.11+ required, found $python_version"
    exit 1
fi

echo "✅ Python version check passed: $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔄 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file from template..."
    cp .env.example .env
    echo "📝 Please edit .env file with your configuration before running the server"
    echo "   Key settings to configure:"
    echo "   - N8N_BASE_URL (default: http://localhost:5678)"
    echo "   - N8N_API_KEY (if using authentication)"
    echo "   - WEBHOOK_SERVER_URL (default: http://localhost:3003)"
    read -p "Press Enter to continue after configuring .env file..."
fi

# Load environment variables
source .env

# Check if N8N is running
echo "🔍 Checking N8N connectivity..."
if curl -s -f "${N8N_BASE_URL:-http://localhost:5678}/api/v1/workflows" > /dev/null 2>&1; then
    echo "✅ N8N is accessible at ${N8N_BASE_URL:-http://localhost:5678}"
else
    echo "⚠️  Warning: N8N not accessible at ${N8N_BASE_URL:-http://localhost:5678}"
    echo "   Please ensure N8N is running before starting the MCP server"
fi

# Check if webhook server is running
echo "🔍 Checking webhook server connectivity..."
if curl -s -f "${WEBHOOK_SERVER_URL:-http://localhost:3003}/api/health" > /dev/null 2>&1; then
    echo "✅ Webhook server is accessible at ${WEBHOOK_SERVER_URL:-http://localhost:3003}"
else
    echo "⚠️  Warning: Webhook server not accessible at ${WEBHOOK_SERVER_URL:-http://localhost:3003}"
    echo "   Please ensure the webhook server is running before starting the MCP server"
fi

# Run tests (optional)
echo ""
read -p "🧪 Would you like to run tests before starting? (y/N): " run_tests
if [[ $run_tests =~ ^[Yy]$ ]]; then
    echo "🧪 Running tests..."
    pytest tests/ -v
    echo "✅ Tests completed"
fi

# Start the MCP server
echo ""
echo "🚀 Starting Sanzo N8N MCP Server..."
echo "   • Server will be available for MCP connections"
echo "   • Press Ctrl+C to stop the server"
echo "   • Logs will show workflow execution details"
echo ""

python -m sanzo_n8n_mcp.server
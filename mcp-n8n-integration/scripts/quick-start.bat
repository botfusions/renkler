@echo off
REM Sanzo N8N MCP Integration - Quick Start Script (Windows)
REM This script sets up and runs the MCP server with proper configuration

echo 🚀 Sanzo N8N MCP Integration - Quick Start
echo ==========================================

REM Check Python version
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Python not found. Please install Python 3.11+
    pause
    exit /b 1
)

echo ✅ Python found

REM Check if virtual environment exists
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔄 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Check if .env file exists
if not exist ".env" (
    echo ⚙️ Creating .env file from template...
    copy .env.example .env
    echo 📝 Please edit .env file with your configuration before running the server
    echo    Key settings to configure:
    echo    - N8N_BASE_URL (default: http://localhost:5678)
    echo    - N8N_API_KEY (if using authentication)
    echo    - WEBHOOK_SERVER_URL (default: http://localhost:3003)
    pause
)

REM Load environment variables (basic check)
if exist ".env" (
    echo ✅ Configuration file found
) else (
    echo ❌ No .env configuration file found
    pause
    exit /b 1
)

REM Check N8N connectivity
echo 🔍 Checking N8N connectivity...
curl -s -f "http://localhost:5678/api/v1/workflows" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Warning: N8N not accessible at http://localhost:5678
    echo    Please ensure N8N is running before starting the MCP server
) else (
    echo ✅ N8N is accessible
)

REM Check webhook server connectivity
echo 🔍 Checking webhook server connectivity...
curl -s -f "http://localhost:3003/api/health" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Warning: Webhook server not accessible at http://localhost:3003
    echo    Please ensure the webhook server is running before starting the MCP server
) else (
    echo ✅ Webhook server is accessible
)

REM Ask about running tests
echo.
set /p run_tests="🧪 Would you like to run tests before starting? (y/N): "
if /i "%run_tests%"=="y" (
    echo 🧪 Running tests...
    pytest tests\ -v
    echo ✅ Tests completed
)

REM Start the MCP server
echo.
echo 🚀 Starting Sanzo N8N MCP Server...
echo    • Server will be available for MCP connections
echo    • Press Ctrl+C to stop the server
echo    • Logs will show workflow execution details
echo.

python -m sanzo_n8n_mcp.server

pause
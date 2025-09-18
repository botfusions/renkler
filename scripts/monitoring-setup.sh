#!/bin/bash

# Monitoring Setup Script for Sanzo Color Advisor
# Ensures proper permissions and directories for production monitoring

set -e

echo "🔧 Setting up monitoring environment..."

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    echo "📁 Creating logs directory..."
    mkdir -p logs
    chmod 755 logs
fi

# Create monitoring data directory
if [ ! -d "monitoring/data" ]; then
    echo "📊 Creating monitoring data directory..."
    mkdir -p monitoring/data
    chmod 755 monitoring/data
fi

# Set proper permissions for log files
echo "🔒 Setting log file permissions..."
touch logs/.gitkeep
chmod 644 logs/.gitkeep

# Verify monitoring endpoints are accessible (if server is running)
if command -v curl &> /dev/null; then
    echo "🏥 Checking if server is running..."

    # Wait for server to start (max 30 seconds)
    timeout=30
    while [ $timeout -gt 0 ]; do
        if curl -s -f http://localhost:3000/api/health > /dev/null 2>&1; then
            echo "✅ Server is running, testing monitoring endpoints..."

            # Test health endpoint
            if curl -s -f http://localhost:3000/api/health > /dev/null; then
                echo "  ✅ Health endpoint: OK"
            else
                echo "  ❌ Health endpoint: FAILED"
            fi

            # Test metrics endpoint
            if curl -s -f http://localhost:3000/metrics > /dev/null; then
                echo "  ✅ Metrics endpoint: OK"
            else
                echo "  ❌ Metrics endpoint: FAILED"
            fi

            # Test analytics endpoint
            if curl -s -f http://localhost:3000/api/analytics/dashboard > /dev/null; then
                echo "  ✅ Analytics endpoint: OK"
            else
                echo "  ❌ Analytics endpoint: FAILED"
            fi

            # Test dashboard
            if curl -s -f http://localhost:3000/dashboard > /dev/null; then
                echo "  ✅ Dashboard: OK"
            else
                echo "  ❌ Dashboard: FAILED"
            fi

            break
        fi

        sleep 1
        timeout=$((timeout - 1))
    done

    if [ $timeout -eq 0 ]; then
        echo "⚠️  Server not running, skipping endpoint tests"
        echo "   Start the server with: npm start"
    fi
else
    echo "⚠️  curl not available, skipping endpoint tests"
fi

echo ""
echo "🎯 Monitoring URLs:"
echo "   Dashboard:  http://localhost:3000/dashboard"
echo "   Health:     http://localhost:3000/api/health"
echo "   Metrics:    http://localhost:3000/metrics"
echo "   Analytics:  http://localhost:3000/api/analytics/dashboard"
echo ""
echo "📋 Log Files:"
echo "   Errors:     logs/error-$(date +%Y-%m-%d).log"
echo "   Combined:   logs/combined-$(date +%Y-%m-%d).log"
echo "   Exceptions: logs/exceptions-$(date +%Y-%m-%d).log"
echo ""
echo "✅ Monitoring setup complete!"
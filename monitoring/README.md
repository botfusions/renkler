# Sanzo Color Advisor - Monitoring & Analytics

This directory contains monitoring and analytics configuration for the Sanzo Color Advisor production deployment.

## 🎯 Features

### Lightweight Production Monitoring
- **Performance Metrics**: Request tracking, response times, memory usage
- **User Analytics**: Privacy-friendly session tracking and usage patterns
- **Error Monitoring**: Real-time error tracking with alerting
- **Usage Dashboard**: Simple web-based analytics dashboard
- **Prometheus Integration**: Standard metrics export for external monitoring

### Key Components

#### 1. Analytics Middleware (`src/middleware/analytics.js`)
- **Request Tracking**: HTTP requests, response times, status codes
- **Color Analysis Metrics**: Room type preferences, age group analysis
- **Session Management**: Privacy-friendly session tracking with hashed IDs
- **Prometheus Metrics**: Standard metrics with custom business metrics

#### 2. Error Monitoring (`src/middleware/errorMonitoring.js`)
- **Error Logging**: Winston-based logging with daily rotation
- **Pattern Detection**: Groups similar errors for better insights
- **Alert System**: Configurable thresholds with cooldown periods
- **Performance Monitoring**: Slow request detection and memory alerts

#### 3. Analytics Dashboard (`public/dashboard.html`)
- **Real-time Metrics**: Live system health and performance data
- **Error Tracking**: Recent error patterns and counts
- **Usage Statistics**: Daily usage trends and API endpoints
- **System Health**: Memory usage, uptime, active sessions

## 🚀 Quick Start

### 1. Setup Monitoring Environment
```bash
# Run setup script to create directories and check permissions
./scripts/monitoring-setup.sh

# Or manually create logs directory
mkdir -p logs
```

### 2. Start Application
```bash
# Development
npm run dev

# Production
npm start
```

### 3. Access Monitoring
- **Dashboard**: http://localhost:3000/dashboard
- **Health Check**: http://localhost:3000/api/health
- **Prometheus Metrics**: http://localhost:3000/metrics
- **Analytics API**: http://localhost:3000/api/analytics/dashboard

## 📊 Dashboard Features

### Overview Stats
- Active sessions (last 30 minutes)
- Total requests
- Recent errors
- System uptime

### Real-time Charts
- Request volume (last 10 minutes)
- Memory usage (heap, RSS)
- Error patterns
- Daily usage statistics

### Error Monitoring
- Top error patterns with counts
- Recent error rates by minute
- System health indicators
- Alert thresholds status

## 🔧 Configuration

### Environment Variables
```bash
# Logging level
LOG_LEVEL=info

# Node environment
NODE_ENV=production

# Server configuration
PORT=3000
HOST=0.0.0.0
```

### Alert Thresholds (Configurable in code)
```javascript
alertThresholds: {
    errorRate: 10,        // errors per minute
    memoryUsage: 0.9,     // 90% memory usage
    responseTime: 5000,   // 5 seconds
    consecutiveErrors: 5
}
```

## 📁 File Structure

```
monitoring/
├── README.md              # This file
├── prometheus.yml         # Prometheus configuration
├── alert_rules.yml        # Alert rules for production
└── data/                  # Runtime monitoring data

src/
├── middleware/
│   ├── analytics.js       # Analytics middleware
│   └── errorMonitoring.js # Error monitoring
├── routes/
│   └── analytics.js       # Analytics API routes
└── monitoring.js          # Integration module

logs/                      # Log files (created at runtime)
├── error-YYYY-MM-DD.log   # Daily error logs
├── combined-YYYY-MM-DD.log # All logs
└── exceptions-YYYY-MM-DD.log # Uncaught exceptions

public/
└── dashboard.html         # Analytics dashboard

scripts/
└── monitoring-setup.sh    # Setup script
```

## 🐳 Docker Integration

The monitoring system is fully integrated with the existing Docker setup:

### Build and Run
```bash
# Build production image
docker build -t sanzo-color-advisor .

# Run with monitoring
docker run -p 3000:3000 -v ./logs:/app/logs sanzo-color-advisor
```

### Docker Compose (if using)
```yaml
version: '3.8'
services:
  sanzo-api:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

## 📈 Metrics Available

### HTTP Metrics
- `sanzo_http_requests_total`: Total HTTP requests
- `sanzo_http_duration_seconds`: Request duration histogram

### Business Metrics
- `sanzo_color_analysis_total`: Color analysis requests
- `sanzo_color_analysis_duration_seconds`: Analysis processing time
- `sanzo_api_usage_total`: API endpoint usage
- `sanzo_errors_total`: Error counts by type
- `sanzo_active_sessions`: Current active sessions

### System Metrics
- `sanzo_memory_usage_bytes`: Memory usage
- Standard Node.js metrics (CPU, GC, etc.)

## 🚨 Alerting

### Built-in Alerts
- High error rate (>10 errors/minute)
- High memory usage (>90%)
- Slow responses (>5 seconds)
- Consecutive errors (>5 in a row)

### Integration Points
Alerts are logged and can be extended to send notifications to:
- Slack webhooks
- Email services
- PagerDuty
- SMS providers

## 📊 External Monitoring Integration

### Prometheus Setup
```yaml
# Add to prometheus.yml
scrape_configs:
  - job_name: 'sanzo-color-advisor'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s
```

### Grafana Dashboard
Import metrics for visualization:
- Request rates and response times
- Error rates and patterns
- Memory and CPU usage
- Business metrics (color analysis trends)

## 🔒 Privacy & Security

### Privacy-Friendly Design
- **No Personal Data**: Sessions identified by hashed IP+UserAgent
- **Automatic Cleanup**: Session data expires after 1 hour of inactivity
- **No Tracking**: No cookies or persistent identifiers
- **Aggregated Data**: Only counts and patterns, no individual tracking

### Security Features
- **Log Rotation**: Automatic daily log rotation with cleanup
- **Error Sanitization**: Stack traces hidden in production
- **Rate Limiting**: Built-in rate limiting for monitoring endpoints
- **Access Control**: Dashboard requires no authentication (consider adding for production)

## 🛠️ Troubleshooting

### Common Issues

#### Logs Directory Missing
```bash
mkdir -p logs
chmod 755 logs
```

#### Metrics Not Available
- Check `/metrics` endpoint
- Verify Prometheus client setup
- Check application logs

#### Dashboard Not Loading
- Verify static file serving
- Check `/dashboard` route
- Ensure public files are accessible

#### High Memory Usage Alerts
- Monitor memory metrics
- Check for memory leaks
- Consider increasing container memory

### Debug Commands
```bash
# Check health
curl http://localhost:3000/api/health

# Get metrics
curl http://localhost:3000/metrics

# View analytics
curl http://localhost:3000/api/analytics/dashboard | jq

# Check logs
tail -f logs/error-$(date +%Y-%m-%d).log
```

## 📝 License

MIT License - Same as the main project
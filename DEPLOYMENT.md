# Sanzo Color Advisor - Deployment Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Docker Deployment](#docker-deployment)
5. [CI/CD Pipeline](#cicd-pipeline)
6. [Production Deployment](#production-deployment)
7. [Monitoring and Health Checks](#monitoring-and-health-checks)
8. [Rollback Procedures](#rollback-procedures)
9. [Troubleshooting](#troubleshooting)
10. [Security Considerations](#security-considerations)

## Overview

The Sanzo Color Advisor is a Node.js/Express API application providing AI-powered color recommendations based on Sanzo Wada's Dictionary of Color Combinations. This guide covers deployment strategies for development, staging, and production environments.

### Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │ → │   Nginx Proxy   │ → │  Sanzo App      │
│   (Optional)    │    │   (SSL/Cache)   │    │  (Node.js)      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                       │
                                               ┌─────────────────┐
                                               │   Redis Cache   │
                                               │   (Optional)    │
                                               └─────────────────┘
```

### Key Features

- **Multi-stage Docker builds** for optimized production images
- **Blue-green deployment** with zero downtime
- **Automated health checks** and monitoring
- **Security scanning** in CI/CD pipeline
- **Rollback capabilities** with backup management
- **Environment-specific configurations**

## Prerequisites

### System Requirements

- **Docker**: 20.10+ with BuildKit support
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (for local development)
- **Git**: 2.30+
- **curl**: For health checks and API testing

### Cloud Requirements (Production)

- **CPU**: 2+ cores
- **Memory**: 4GB+ RAM
- **Storage**: 20GB+ SSD
- **Network**: Stable internet connection with HTTPS support

### Required Tools

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Verify installations
docker --version
docker-compose --version
```

## Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-username/sanzo-color-advisor.git
cd sanzo-color-advisor
```

### 2. Environment Configuration

Choose the appropriate environment file:

```bash
# Development
cp .env.development .env

# Staging
cp .env.staging .env

# Production
cp .env.production .env

# Test
cp .env.test .env
```

### 3. Configure Environment Variables

Edit `.env` file with your specific values:

```bash
# Required Configuration
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-domain.com

# Optional GitHub Integration
GITHUB_TOKEN=your_github_token_here

# Production Security
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

## Docker Deployment

### Local Development

```bash
# Start development environment
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f sanzo-app

# Stop services
docker-compose down
```

### Testing Environment

```bash
# Run all tests
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

# Run specific test suites
docker-compose -f docker-compose.yml -f docker-compose.test.yml --profile api-test up
docker-compose -f docker-compose.yml -f docker-compose.test.yml --profile performance up
docker-compose -f docker-compose.yml -f docker-compose.test.yml --profile security up
```

### Production Deployment

```bash
# Basic production deployment
docker-compose up -d

# Production with monitoring
docker-compose --profile monitoring up -d

# Production with scaling and Redis
docker-compose --profile production --profile scaling up -d
```

## CI/CD Pipeline

### GitHub Actions Setup

1. **Configure Repository Secrets**:
   ```
   GITHUB_TOKEN          # For container registry
   SNYK_TOKEN           # For security scanning
   SLACK_WEBHOOK_URL    # For notifications (optional)
   ```

2. **Branch Protection Rules**:
   - Require pull request reviews
   - Require status checks to pass
   - Restrict pushes to main branch

3. **Environment Protection**:
   - Production environment requires manual approval
   - Staging environment auto-deploys from develop branch

### Pipeline Stages

1. **Code Quality & Testing**
   - ESLint code analysis
   - Unit and integration tests
   - Code coverage reporting

2. **Security Scanning**
   - Dependency vulnerability scan
   - Container image security scan
   - Static code analysis

3. **Build & Push**
   - Multi-platform Docker builds
   - Container registry push
   - Image signing and attestation

4. **Deployment**
   - Staging deployment (automatic)
   - Production deployment (manual approval)
   - Smoke tests and validation

### Manual Deployment Trigger

```bash
# Trigger deployment via GitHub CLI
gh workflow run "CI/CD Pipeline" \
  --ref main \
  --field environment=production \
  --field image_tag=v1.2.0
```

## Production Deployment

### Using Deployment Script

The included deployment script provides automated blue-green deployment:

```bash
# Deploy specific version
./scripts/deploy.sh -e production -i sanzo:v1.2.0 -b deploy

# Deploy with rollback on failure
./scripts/deploy.sh -e production -i sanzo:v1.2.0 -r true deploy

# Check deployment status
./scripts/deploy.sh status

# Manual rollback
./scripts/deploy.sh rollback
```

### Manual Production Deployment

1. **Prepare Environment**:
   ```bash
   # Create production directories
   sudo mkdir -p /opt/sanzo/{data,logs,backups,ssl}
   sudo chown -R $USER:$USER /opt/sanzo

   # Copy SSL certificates
   sudo cp your-cert.pem /opt/sanzo/ssl/
   sudo cp your-key.pem /opt/sanzo/ssl/
   ```

2. **Deploy Application**:
   ```bash
   # Pull latest images
   docker-compose pull

   # Start services
   docker-compose up -d

   # Verify deployment
   ./scripts/health-check.sh -h localhost -p 3000 -v
   ```

3. **Configure Reverse Proxy** (Nginx):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }

   server {
       listen 443 ssl http2;
       server_name your-domain.com;

       ssl_certificate /opt/sanzo/ssl/cert.pem;
       ssl_certificate_key /opt/sanzo/ssl/key.pem;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /api/health {
           proxy_pass http://localhost:3000/api/health;
           access_log off;
       }
   }
   ```

## Monitoring and Health Checks

### Health Check Endpoints

- **Basic Health**: `GET /api/health`
- **Deep Health**: Includes service dependencies
- **Metrics**: `GET /metrics` (when enabled)

### Using Health Check Script

```bash
# Basic health check
./scripts/health-check.sh

# Verbose health check with all tests
./scripts/health-check.sh -v

# Remote health check
./scripts/health-check.sh -h api.example.com -p 443

# JSON output for monitoring systems
./scripts/health-check.sh -f json -m /tmp/health.json

# Prometheus metrics format
./scripts/health-check.sh -f prometheus > /tmp/metrics.prom
```

### Monitoring Stack (Optional)

Enable monitoring profile for full observability:

```bash
# Start with monitoring
docker-compose --profile monitoring up -d

# Access dashboards
open http://localhost:9090  # Prometheus
open http://localhost:3001  # Grafana (admin/admin123)
```

### Alerting Rules

Create alerting rules based on health check metrics:

```yaml
# prometheus-alerts.yml
groups:
  - name: sanzo-alerts
    rules:
      - alert: SanzoServiceDown
        expr: sanzo_health_check{check="connectivity"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Sanzo Color Advisor service is down"

      - alert: SanzoHighResponseTime
        expr: sanzo_response_time_seconds > 5
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Sanzo Color Advisor high response time"
```

## Rollback Procedures

### Automated Rollback

The deployment script supports automatic rollback on failure:

```bash
# Deploy with automatic rollback
./scripts/deploy.sh -e production -i sanzo:v1.2.0 -r true deploy

# Manual rollback to previous version
./scripts/deploy.sh rollback
```

### Manual Rollback Steps

1. **Identify Issue**:
   ```bash
   # Check service status
   ./scripts/health-check.sh -v

   # Check recent logs
   docker-compose logs --tail=100 sanzo-app
   ```

2. **Stop Current Service**:
   ```bash
   docker-compose stop sanzo-app
   ```

3. **Restore from Backup**:
   ```bash
   # List available backups
   ls -la /opt/sanzo/backups/

   # Restore specific backup
   tar -xzf /opt/sanzo/backups/sanzo_backup_20241216_143022.tar.gz -C /opt/sanzo/
   ```

4. **Start Previous Version**:
   ```bash
   docker-compose up -d sanzo-app
   ```

5. **Verify Rollback**:
   ```bash
   ./scripts/health-check.sh -v
   ```

### Database Rollback (if applicable)

```bash
# Create database backup before deployment
pg_dump sanzo_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database if needed
psql sanzo_db < backup_20241216_143022.sql
```

## Troubleshooting

### Common Issues

#### Container Won't Start

```bash
# Check container logs
docker-compose logs sanzo-app

# Common causes:
# - Port already in use
# - Missing environment variables
# - Invalid configuration
# - Insufficient permissions

# Solutions:
# Change port in .env file
sudo netstat -tlnp | grep :3000

# Check environment variables
docker-compose config

# Fix permissions
sudo chown -R $USER:$USER /opt/sanzo
```

#### Health Check Failures

```bash
# Detailed health check
./scripts/health-check.sh -v

# Check specific endpoints
curl -v http://localhost:3000/api/health
curl -v http://localhost:3000/api/colors?limit=1

# Common causes:
# - Service still starting up
# - Database connection issues
# - External API rate limits
# - Network connectivity problems
```

#### Performance Issues

```bash
# Monitor resource usage
docker stats sanzo-color-advisor

# Check application metrics
./scripts/health-check.sh -f json | jq '.checks.performance'

# Analyze logs for slow requests
docker-compose logs sanzo-app | grep "slow"

# Solutions:
# - Increase container resources
# - Enable caching (Redis)
# - Optimize database queries
# - Scale horizontally
```

#### SSL/HTTPS Issues

```bash
# Check SSL certificate
openssl x509 -in /opt/sanzo/ssl/cert.pem -text -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.crt cert.pem

# Test SSL connection
openssl s_client -connect your-domain.com:443

# Common causes:
# - Expired certificates
# - Incorrect certificate chain
# - Mismatched domain names
# - Firewall blocking port 443
```

### Log Analysis

```bash
# Application logs
docker-compose logs -f sanzo-app

# System logs
journalctl -u docker.service -f

# Nginx logs (if using reverse proxy)
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Container resource usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"
```

### Emergency Procedures

#### Service Recovery

```bash
# Quick restart
docker-compose restart sanzo-app

# Full restart with fresh container
docker-compose down
docker-compose pull
docker-compose up -d

# Emergency rollback
./scripts/deploy.sh rollback
```

#### Data Recovery

```bash
# Restore from latest backup
LATEST_BACKUP=$(ls -t /opt/sanzo/backups/*.tar.gz | head -1)
tar -xzf "$LATEST_BACKUP" -C /opt/sanzo/

# Verify data integrity
curl http://localhost:3000/api/colors?limit=1
```

## Security Considerations

### Container Security

- **Non-root user**: Application runs as unprivileged user
- **Read-only filesystem**: Container filesystem is read-only where possible
- **Minimal base image**: Using Alpine Linux for smaller attack surface
- **Security scanning**: Automated vulnerability scanning in CI/CD

### Network Security

- **HTTPS enforcement**: All production traffic encrypted
- **Security headers**: HSTS, CSP, X-Frame-Options implemented
- **Rate limiting**: API endpoints protected against abuse
- **CORS configuration**: Restricted to allowed origins

### Secrets Management

```bash
# Use Docker secrets for sensitive data
echo "your-secret" | docker secret create github-token -

# Mount secrets in container
services:
  sanzo-app:
    secrets:
      - github-token
    environment:
      - GITHUB_TOKEN_FILE=/run/secrets/github-token
```

### Security Monitoring

```bash
# Regular security scans
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image sanzo-color-advisor:latest

# Monitor security logs
tail -f /var/log/auth.log | grep -i "sanzo"

# Check for unauthorized access
grep -i "unauthorized\|forbidden" /opt/sanzo/logs/*.log
```

### Compliance

- **GDPR compliance**: Data retention and privacy controls
- **Security headers**: Implemented according to OWASP guidelines
- **Audit logging**: All significant events logged
- **Access controls**: Role-based access to production systems

---

## Quick Reference

### Essential Commands

```bash
# Development
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d

# Testing
docker-compose -f docker-compose.yml -f docker-compose.test.yml up --abort-on-container-exit

# Production
docker-compose up -d

# Health Check
./scripts/health-check.sh -v

# Deployment
./scripts/deploy.sh -e production -i sanzo:latest deploy

# Rollback
./scripts/deploy.sh rollback

# Logs
docker-compose logs -f sanzo-app

# Status
./scripts/deploy.sh status
```

### Environment Files

- `.env.development` - Local development
- `.env.staging` - Pre-production testing
- `.env.production` - Live production
- `.env.test` - Automated testing

### Key Ports

- `3000` - Main application
- `9090` - Prometheus metrics
- `3001` - Grafana dashboard
- `80/443` - Nginx proxy (production)

### Support

For deployment issues or questions:

1. Check the troubleshooting section above
2. Review application logs: `docker-compose logs sanzo-app`
3. Run health check: `./scripts/health-check.sh -v`
4. Create GitHub issue with logs and configuration details

---

*Last updated: December 2024*
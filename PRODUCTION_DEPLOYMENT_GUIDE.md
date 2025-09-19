# Production Deployment Guide - Sanzo Color Advisor

Complete guide for deploying the Sanzo Color Advisor to production using GitHub + Netlify.

## Overview

This guide covers deploying a full-stack N8N workflow automation system with MCP integration to production:

- **Frontend**: Static files served via Netlify
- **Backend API**: Node.js Express server
- **Database**: Supabase (self-hosted on turklawai.com)
- **CI/CD**: GitHub Actions with automated testing and deployment
- **Monitoring**: Built-in health checks and analytics

## Prerequisites

### Required Accounts
- [ ] GitHub account with repository access
- [ ] Netlify account (free tier sufficient)
- [ ] Supabase instance (configured on turklawai.com)
- [ ] OpenAI API key (for image analysis)
- [ ] Cloudinary account (for image processing)

### Required Tools
- [ ] Git CLI
- [ ] Node.js 18+
- [ ] npm or yarn package manager

## 1. GitHub Repository Setup

### 1.1 Create Repository
```bash
# Navigate to project
cd /path/to/sanzo-color-advisor

# Initialize git if not done
git init
git add .
git commit -m "Initial commit: Complete Sanzo Color Advisor with N8N automation"

# Add GitHub remote
git remote add origin https://github.com/yourusername/sanzo-color-advisor.git
git branch -M main
git push -u origin main
```

### 1.2 Configure Repository Secrets
Go to GitHub repository → Settings → Secrets and variables → Actions

Add these repository secrets:

#### Netlify Deployment
```
NETLIFY_AUTH_TOKEN=your_netlify_auth_token
NETLIFY_SITE_ID=your_netlify_site_id
```

#### API Keys (Optional for full functionality)
```
OPENAI_API_KEY=your_openai_key
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
SNYK_TOKEN=your_snyk_token_for_security_scanning
SLACK_WEBHOOK_URL=your_slack_webhook_for_notifications
```

### 1.3 Create GitHub Environment
1. Go to Settings → Environments
2. Create "production" environment
3. Add protection rules:
   - Required reviewers (recommended)
   - Restrict pushes to main branch

## 2. Netlify Configuration

### 2.1 Create Netlify Site
1. Log in to Netlify Dashboard
2. Click "New site from Git"
3. Connect your GitHub repository
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `public`
   - **Branch**: `main`

### 2.2 Environment Variables in Netlify
Go to Site settings → Environment variables and add:

```bash
# Core Configuration
NODE_ENV=production
PORT=8888

# Supabase Configuration
REACT_APP_SUPABASE_URL=https://supabase.turklawai.com
REACT_APP_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc1NjY1MTM4MCwiZXhwIjo0OTEyMzI0OTgwLCJyb2xlIjoiYW5vbiJ9.tDEh7l2zecY6zLl19zVT3U_e7seWAiuBMcdnCcq2Jxo
SUPABASE_SERVICE_KEY=your_production_service_key
SUPABASE_SCHEMA=sanzo_color_advisor

# CORS Configuration
ALLOWED_ORIGINS=https://your-site.netlify.app

# Image Analysis
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Security
JWT_SECRET=your_secure_jwt_secret_32_chars_minimum
ENCRYPTION_KEY=your_encryption_key_32_chars
TRUST_PROXY=true

# Feature Flags
ENABLE_IMAGE_ANALYSIS=true
ENABLE_AI_RECOMMENDATIONS=true
ENABLE_ANALYTICS_TRACKING=true

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=1000
ANALYSIS_RATE_LIMIT_MAX_REQUESTS=50
```

### 2.3 Domain Configuration (Optional)
1. Go to Domain settings
2. Add custom domain
3. Configure DNS:
   - **CNAME**: `your-domain.com` → `your-site.netlify.app`
   - SSL will be automatically configured

## 3. Database Setup

### 3.1 Supabase Configuration
The project is configured to use the existing Supabase instance at `https://supabase.turklawai.com`.

#### Schema Setup
```sql
-- Run these commands in Supabase SQL Editor
CREATE SCHEMA IF NOT EXISTS sanzo_color_advisor;

-- Set schema for this session
SET search_path TO sanzo_color_advisor;

-- Create tables (run the scripts in /supabase/migrations/)
-- Tables: users, color_combinations, user_sessions, analytics_events
```

#### Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE sanzo_color_combinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to color data
CREATE POLICY "Enable read access for all users" ON sanzo_color_combinations
FOR SELECT USING (true);
```

### 3.2 Database Migration
```bash
# Run locally to set up schema
npm run supabase:migrate

# Or run the setup script
node scripts/create-schema.js
```

## 4. CI/CD Pipeline

### 4.1 Automated Deployment Flow
The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) handles:

1. **Testing**: ESLint, Jest tests, API endpoint tests
2. **Security**: npm audit, Snyk vulnerability scanning
3. **Building**: Container image build and push to GitHub Container Registry
4. **Deployment**: Automated Netlify deployment on main branch pushes
5. **Verification**: Post-deployment health checks

### 4.2 Deployment Triggers
- **Netlify Deploy**: Push to `main` branch or release creation
- **Container Deploy**: Release creation only
- **Staging Deploy**: Push to `develop` branch

### 4.3 Manual Deployment
```bash
# Build and deploy manually
npm run build
npx netlify deploy --prod --dir=public

# Or using Netlify CLI with auth
netlify login
netlify deploy --prod
```

## 5. Monitoring and Health Checks

### 5.1 Built-in Endpoints
- **Health Check**: `https://your-site.netlify.app/api/health`
- **Metrics**: `https://your-site.netlify.app/metrics`
- **Analytics**: `https://your-site.netlify.app/api/analytics/dashboard`

### 5.2 Monitoring Setup
```bash
# Check deployment health
curl -f https://your-site.netlify.app/api/health

# View metrics
curl https://your-site.netlify.app/metrics
```

### 5.3 Error Tracking
Configure Sentry or similar error tracking:
```bash
# Add to Netlify environment variables
ERROR_TRACKING_DSN=your_sentry_dsn_here
```

## 6. N8N Workflow Integration

### 6.1 Production N8N Setup
For production N8N workflows:

1. **Deploy N8N Instance**: Use Docker or cloud hosting
2. **Configure Webhooks**: Update webhook URLs in workflows
3. **Environment Variables**:
   ```bash
   N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
   N8N_API_KEY=your_n8n_api_key
   ```

### 6.2 MCP Integration
The MCP-N8N integration (`/mcp-n8n-integration/`) provides:
- Automated workflow triggering
- Data synchronization
- Error handling and retry logic

## 7. Security Considerations

### 7.1 API Security
- Rate limiting configured (1000 requests/15min)
- CORS properly configured
- JWT authentication for admin functions
- Input validation with Joi schemas

### 7.2 Environment Security
- All secrets stored in Netlify environment variables
- No sensitive data in repository
- HTTPS enforced
- Security headers configured in `netlify.toml`

### 7.3 Database Security
- Supabase RLS enabled
- Schema isolation (`sanzo_color_advisor`)
- Service key restricted access

## 8. Performance Optimization

### 8.1 Caching Strategy
- Static assets cached for 1 year
- API responses cached for 1 hour
- Browser caching headers configured

### 8.2 Image Optimization
- Cloudinary for image processing
- WebP format support
- Automatic compression

### 8.3 CDN Configuration
Netlify automatically provides:
- Global CDN distribution
- Asset optimization
- Gzip compression

## 9. Rollback Procedures

### 9.1 Automated Rollback
GitHub Actions includes rollback workflow:
```bash
# Trigger rollback (manual)
gh workflow run "CI/CD Pipeline" --ref main -f rollback=true
```

### 9.2 Manual Rollback
```bash
# Netlify CLI rollback
netlify sites:list
netlify rollback --site-id=your_site_id

# Or via Netlify Dashboard
# Go to Deploys → Click previous deploy → Publish deploy
```

### 9.3 Database Rollback
```bash
# If schema changes need rollback
npm run supabase:reset
# Then re-run migrations to desired state
```

## 10. Troubleshooting

### 10.1 Common Issues

#### Build Failures
```bash
# Check build logs in Netlify dashboard
# Common fixes:
npm ci --legacy-peer-deps
npm run build --verbose
```

#### API Errors
```bash
# Check environment variables
# Verify Supabase connection
node scripts/test-connection.js
```

#### CORS Issues
```bash
# Update ALLOWED_ORIGINS in Netlify environment
# Check netlify.toml headers configuration
```

### 10.2 Debug Commands
```bash
# Test health endpoints
curl -v https://your-site.netlify.app/api/health

# Check environment
node -e "console.log(process.env.NODE_ENV)"

# Test database connection
npm run test:api
```

### 10.3 Log Analysis
```bash
# View Netlify function logs
netlify logs --live

# Check GitHub Actions logs
# Go to Actions tab in GitHub repository
```

## 11. Cost Optimization

### 11.1 Free Tier Limits
- **Netlify**: 100GB bandwidth/month, 300 build minutes
- **GitHub Actions**: 2000 minutes/month
- **Supabase**: Configured on existing turklawai.com instance

### 11.2 Optimization Tips
- Use branch deploys for testing
- Optimize build time with caching
- Monitor bandwidth usage
- Use Netlify Analytics for traffic insights

## 12. Post-Deployment Checklist

- [ ] Verify all endpoints return 200 status
- [ ] Test image upload and analysis
- [ ] Confirm color recommendation functionality
- [ ] Verify N8N workflow integration
- [ ] Check analytics tracking
- [ ] Test admin authentication
- [ ] Validate CORS configuration
- [ ] Confirm error tracking setup
- [ ] Test mobile responsiveness
- [ ] Verify accessibility features

## 13. Maintenance

### 13.1 Regular Tasks
- Monitor error tracking dashboard
- Review security scan results
- Update dependencies monthly
- Check performance metrics weekly

### 13.2 Backup Strategy
- Database: Supabase automatic backups
- Code: GitHub repository
- Environment: Document all environment variables

### 13.3 Updates
```bash
# Update dependencies
npm update
npm audit fix

# Test and deploy
npm test
git add .
git commit -m "Update dependencies"
git push origin main
```

## Support

For deployment issues:
1. Check this documentation
2. Review GitHub Actions logs
3. Check Netlify deploy logs
4. Verify environment variables
5. Test local build: `npm run build && npm run serve`

Remember to test all functionality after deployment and monitor the application for the first 24 hours to ensure stability.
# Deployment Checklist - Sanzo Color Advisor

Quick reference checklist for deploying to GitHub + Netlify.

## Pre-Deployment Checklist

### Repository Setup
- [ ] GitHub repository created
- [ ] Local git repository initialized and connected
- [ ] `.gitignore` configured properly
- [ ] All sensitive files excluded from version control

### Environment Configuration
- [ ] `.env.example` file updated with all required variables
- [ ] Production environment variables documented
- [ ] Supabase connection tested
- [ ] API keys obtained (OpenAI, Cloudinary, etc.)

### Code Quality
- [ ] All tests passing (`npm test`)
- [ ] Linting clean (`npm run lint`)
- [ ] Build successful (`npm run build`)
- [ ] No console errors in production build

### Security
- [ ] No API keys or secrets in code
- [ ] Environment variables properly configured
- [ ] CORS settings reviewed
- [ ] Rate limiting configured

## GitHub Setup Checklist

### Repository Configuration
- [ ] Repository created on GitHub
- [ ] Main branch protected (optional)
- [ ] Repository secrets configured:
  - [ ] `NETLIFY_AUTH_TOKEN`
  - [ ] `NETLIFY_SITE_ID`
  - [ ] `OPENAI_API_KEY` (optional)
  - [ ] `CLOUDINARY_API_KEY` (optional)
  - [ ] `SNYK_TOKEN` (optional)

### GitHub Actions
- [ ] CI/CD workflow file present (`.github/workflows/ci-cd.yml`)
- [ ] Workflow permissions configured
- [ ] Branch protection rules set (optional)

## Netlify Setup Checklist

### Site Configuration
- [ ] Netlify account created
- [ ] New site created from GitHub repository
- [ ] Build settings configured:
  - [ ] Build command: `npm run build`
  - [ ] Publish directory: `public`
  - [ ] Branch to deploy: `main`

### Environment Variables in Netlify
Copy values from `.env.netlify` template:

#### Required
- [ ] `NODE_ENV=production`
- [ ] `REACT_APP_SUPABASE_URL`
- [ ] `REACT_APP_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_KEY`

#### Optional (for full functionality)
- [ ] `OPENAI_API_KEY`
- [ ] `CLOUDINARY_CLOUD_NAME`
- [ ] `CLOUDINARY_API_KEY`
- [ ] `CLOUDINARY_API_SECRET`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`

#### Security & Performance
- [ ] `ALLOWED_ORIGINS`
- [ ] `TRUST_PROXY=true`
- [ ] `RATE_LIMIT_MAX_REQUESTS=1000`

### Domain Configuration (Optional)
- [ ] Custom domain added
- [ ] DNS configured
- [ ] SSL certificate active

## Database Setup Checklist

### Supabase Configuration
- [ ] Supabase project accessible at `https://supabase.turklawai.com`
- [ ] Schema `sanzo_color_advisor` created
- [ ] Tables created:
  - [ ] `sanzo_color_combinations`
  - [ ] `sanzo_user_sessions`
  - [ ] `sanzo_analytics_events`
- [ ] Row Level Security (RLS) policies configured
- [ ] Service key permissions verified

### Data Migration
- [ ] Color data seeded
- [ ] Test user created (if needed)
- [ ] Database connection tested from production

## Deployment Process Checklist

### Automated Deployment
- [ ] Code committed to main branch
- [ ] GitHub Actions workflow triggered
- [ ] All tests passing in CI
- [ ] Security scans completed
- [ ] Build successful
- [ ] Netlify deployment completed

### Manual Deployment (Alternative)
- [ ] Run `./scripts/netlify-deploy.sh`
- [ ] Or use Netlify CLI: `netlify deploy --prod --dir=public`

## Post-Deployment Verification

### Functionality Testing
- [ ] Homepage loads correctly
- [ ] Color recommendation system works
- [ ] Image upload and analysis functional
- [ ] API endpoints responding
- [ ] Database connections active

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] Mobile responsiveness verified
- [ ] CDN serving static assets

### Health Checks
- [ ] Health endpoint responding: `/api/health`
- [ ] Metrics endpoint accessible: `/metrics`
- [ ] Analytics tracking working
- [ ] Error tracking configured (if enabled)

### Security Verification
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] CORS working correctly
- [ ] Rate limiting functional
- [ ] No sensitive data exposed

## Monitoring Setup

### Netlify Monitoring
- [ ] Deploy notifications configured
- [ ] Analytics enabled
- [ ] Forms configured (if used)
- [ ] Functions monitoring (if applicable)

### Application Monitoring
- [ ] Health check monitoring
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] User analytics

## Rollback Plan

### Preparation
- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Database backup available
- [ ] Rollback contacts identified

### Emergency Rollback
- [ ] Netlify: Previous deploy can be published
- [ ] GitHub: Revert commit available
- [ ] Database: Rollback script ready

## Documentation

### Updated Documentation
- [ ] README.md updated with production URLs
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Deployment guide complete

### Team Knowledge
- [ ] Deployment process documented
- [ ] Access credentials shared securely
- [ ] Emergency procedures documented
- [ ] Monitoring alerts configured

## Maintenance

### Regular Tasks
- [ ] Dependencies updated monthly
- [ ] Security patches applied
- [ ] Performance monitoring
- [ ] Error log review

### Backup Strategy
- [ ] Database backups automated
- [ ] Code repository backed up
- [ ] Environment configuration documented
- [ ] Recovery procedures tested

## Quick Commands Reference

```bash
# Test locally
npm test
npm run lint
npm run build
npm run serve

# Deploy using script
./scripts/netlify-deploy.sh

# Manual Netlify deploy
netlify deploy --prod --dir=public

# Check health
curl https://your-domain.netlify.app/api/health

# View logs
netlify logs --live
```

## Troubleshooting Quick Fixes

### Build Failures
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear npm cache
npm cache clean --force
```

### Environment Issues
```bash
# Check environment variables in Netlify dashboard
# Verify .env.netlify template is followed
# Test connection with node scripts/test-connection.js
```

### CORS Issues
```bash
# Update ALLOWED_ORIGINS in Netlify environment
# Check netlify.toml headers configuration
# Verify API endpoint configurations
```

## Success Criteria

Deployment is successful when:
- [ ] Application loads without errors
- [ ] All core features functional
- [ ] Performance metrics meet targets
- [ ] Security scans pass
- [ ] Monitoring active
- [ ] Documentation complete

## Emergency Contacts

- **GitHub Issues**: Repository issues tab
- **Netlify Support**: Netlify dashboard support
- **Supabase Support**: Supabase dashboard
- **Development Team**: [Add contact information]

---

**Last Updated**: [Update when deployment is complete]
**Deployed Version**: [Version number]
**Deployment Date**: [Deployment date]
**Deployed By**: [Deployer name]
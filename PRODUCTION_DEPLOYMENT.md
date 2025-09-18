# 🚀 Production Deployment Guide - Sanzo Color Advisor

Self-hosted Supabase instance deployment for turklawai.com

## 📋 Prerequisites

- ✅ Self-hosted Supabase instance at `https://supabase.turklawai.com`
- ✅ Google Cloud Console access for OAuth setup
- ✅ Domain with SSL certificate
- ✅ Docker/Kubernetes environment

## 🔧 Step 1: Google OAuth Setup

### 1.1 Google Cloud Console Configuration
```bash
# Go to: https://console.cloud.google.com/
# 1. Create new project: "Sanzo Color Advisor"
# 2. Enable APIs:
#    - Google+ API
#    - Google Identity API
# 3. Configure OAuth consent screen:
#    - App name: Sanzo Color Advisor
#    - User support email: admin@turklawai.com
#    - Developer contact: admin@turklawai.com
```

### 1.2 OAuth 2.0 Client ID Creation
```bash
# Application type: Web application
# Name: Sanzo Color Advisor Production
# Authorized JavaScript origins:
#   - https://supabase.turklawai.com
#   - https://sanzo-color-advisor.turklawai.com
# Authorized redirect URIs:
#   - https://supabase.turklawai.com/auth/v1/callback
```

## 🗄️ Step 2: Database Setup

### 2.1 Run Multi-Schema Migration
```sql
-- Connect to your Supabase PostgreSQL instance
-- Run: supabase/multi-schema-database.sql
\i /path/to/multi-schema-database.sql
```

### 2.2 Configure OAuth in Supabase
```sql
-- Update with your actual Google OAuth credentials
-- Run: supabase/google-oauth-config.sql
UPDATE auth.providers SET config = '{
  "enabled": true,
  "client_id": "YOUR_ACTUAL_GOOGLE_CLIENT_ID",
  "client_secret": "YOUR_ACTUAL_GOOGLE_CLIENT_SECRET",
  "redirect_uri": "https://supabase.turklawai.com/auth/v1/callback"
}'::jsonb WHERE id = 'google';
```

## ⚙️ Step 3: Environment Configuration

### 3.1 Production Environment Variables
```bash
# Copy and update production environment
cp .env.production .env

# Update these critical values:
SUPABASE_SERVICE_KEY=your_actual_service_key_here
GOOGLE_CLIENT_ID=your_actual_google_client_id
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret
JWT_SECRET=your_32_char_production_secret
ENCRYPTION_KEY=your_32_char_encryption_key
```

### 3.2 Security Configuration
```bash
# Generate secure secrets
openssl rand -hex 32  # For JWT_SECRET
openssl rand -hex 32  # For ENCRYPTION_KEY
```

## 🐳 Step 4: Docker Deployment

### 4.1 Build Production Image
```bash
# Build optimized production image
docker build -t sanzo-color-advisor:production .

# Or using Docker Compose
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### 4.2 Kubernetes Deployment (Optional)
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sanzo-color-advisor
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sanzo-color-advisor
  template:
    metadata:
      labels:
        app: sanzo-color-advisor
    spec:
      containers:
      - name: sanzo-color-advisor
        image: sanzo-color-advisor:production
        ports:
        - containerPort: 3000
        envFrom:
        - secretRef:
            name: sanzo-env-secrets
```

## 👤 Step 5: Admin User Setup

### 5.1 Install Dependencies
```bash
npm install --production
```

### 5.2 Create Admin User
```bash
# Run admin creation script
npm run create-admin

# Expected output:
# ✅ Admin user created successfully!
#    Email: admin@sanzo-color-advisor.com
#    Password: SanzoAdmin2025!
```

### 5.3 Verify Database Setup
```bash
# Test database connection
node -e "
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  'https://supabase.turklawai.com',
  process.env.REACT_APP_SUPABASE_ANON_KEY
);
supabase.from('sanzo_profiles').select('count').then(console.log);
"
```

## 🔍 Step 6: Testing & Verification

### 6.1 Health Check
```bash
# Start application
npm start

# Test endpoints
curl https://sanzo-color-advisor.turklawai.com/api/health
curl https://sanzo-color-advisor.turklawai.com/api/auth/user
```

### 6.2 OAuth Testing
```bash
# Test Google OAuth flow
# 1. Visit: https://sanzo-color-advisor.turklawai.com/auth/google
# 2. Complete Google login
# 3. Verify redirect to: /auth/callback
# 4. Check user creation in sanzo_profiles table
```

### 6.3 Admin Login Test
```bash
# Test admin credentials
curl -X POST https://sanzo-color-advisor.turklawai.com/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sanzo-color-advisor.com",
    "password": "SanzoAdmin2025!"
  }'
```

## 📊 Step 7: Monitoring Setup

### 7.1 Application Metrics
```bash
# Enable monitoring
npm run monitoring:setup

# Access metrics
curl https://sanzo-color-advisor.turklawai.com/metrics
```

### 7.2 Database Monitoring
```sql
-- Check table counts
SELECT
  schemaname,
  tablename,
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes
FROM pg_stat_user_tables
WHERE schemaname = 'sanzo_color_advisor';
```

## 🔐 Step 8: Security Hardening

### 8.1 SSL/TLS Configuration
```bash
# Ensure HTTPS redirect
FORCE_HTTPS=true
TRUST_PROXY=true

# Security headers
SECURITY_HEADERS_ENABLED=true
CSP_POLICY="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'"
```

### 8.2 Rate Limiting
```bash
# Production rate limits
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ANALYSIS_RATE_LIMIT_MAX_REQUESTS=10
```

## 📝 Step 9: Backup Strategy

### 9.1 Database Backup
```bash
# Daily automated backup
pg_dump -h supabase.turklawai.com -d postgres -n sanzo_color_advisor > backup_$(date +%Y%m%d).sql

# Backup retention: 90 days
find /backups -name "backup_*.sql" -mtime +90 -delete
```

### 9.2 Application Backup
```bash
# Backup uploaded files
rsync -av uploads/ /backup/uploads/

# Backup application logs
rsync -av logs/ /backup/logs/
```

## 🎯 Step 10: Go Live Checklist

- [ ] ✅ Multi-schema database deployed
- [ ] ✅ Google OAuth configured and tested
- [ ] ✅ Admin user created and verified
- [ ] ✅ Production environment variables set
- [ ] ✅ SSL certificate configured
- [ ] ✅ Rate limiting enabled
- [ ] ✅ Security headers configured
- [ ] ✅ Monitoring and health checks working
- [ ] ✅ Backup strategy implemented
- [ ] ✅ Error tracking configured

## 🆘 Troubleshooting

### Common Issues

#### 1. OAuth Not Working
```bash
# Check OAuth configuration
SELECT * FROM auth.providers WHERE id = 'google';

# Verify redirect URIs match exactly
# Check client ID/secret are correct
```

#### 2. Database Connection Failed
```bash
# Check schema exists
\dn sanzo_color_advisor

# Verify tables created
\dt sanzo_color_advisor.sanzo_*
```

#### 3. Admin User Creation Failed
```bash
# Check service key permissions
# Verify schema prefix in environment
echo $SUPABASE_TABLE_PREFIX

# Run with debug
DEBUG=* npm run create-admin
```

## 📞 Support

- **Technical Issues**: Check logs at `/var/log/sanzo-color-advisor/`
- **Database Issues**: Connect to Supabase PostgreSQL directly
- **OAuth Issues**: Verify Google Cloud Console configuration

## 🎉 Success!

Your Sanzo Color Advisor is now live at:
- **Application**: https://sanzo-color-advisor.turklawai.com
- **Admin Panel**: Login with admin@sanzo-color-advisor.com
- **API Health**: https://sanzo-color-advisor.turklawai.com/api/health

Ready for customer color analysis! 🎨
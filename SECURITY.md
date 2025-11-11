# Security Documentation

## Overview

This document outlines the security controls and best practices implemented in the Sanzo Color Advisor application.

## Table of Contents

1. [Security Features](#security-features)
2. [Authentication & Authorization](#authentication--authorization)
3. [Session Management](#session-management)
4. [Password Security](#password-security)
5. [CSRF Protection](#csrf-protection)
6. [File Upload Security](#file-upload-security)
7. [PII Protection](#pii-protection)
8. [Security Headers](#security-headers)
9. [Rate Limiting](#rate-limiting)
10. [Security Configuration](#security-configuration)
11. [Deployment Security](#deployment-security)
12. [Security Best Practices](#security-best-practices)
13. [Incident Response](#incident-response)

---

## Security Features

### ✅ Implemented Security Controls

- **Authentication**: JWT-based authentication via Supabase
- **Authorization**: Role-based access control (RBAC) and permission-based authorization
- **Session Management**: Secure session tracking with timeout and concurrent session limits
- **Password Security**: Strong password requirements with complexity validation
- **CSRF Protection**: Token-based CSRF protection for state-changing operations
- **File Upload Security**: Comprehensive file validation and malware scanning
- **PII Protection**: Automatic PII filtering in logs and error messages
- **Security Headers**: Comprehensive security headers (Helmet.js)
- **Rate Limiting**: Multiple rate limiting strategies for different endpoints
- **Input Validation**: Joi-based validation for all user inputs
- **SQL Injection Protection**: Supabase ORM with parameterized queries
- **XSS Protection**: Content Security Policy and output encoding
- **Clickjacking Protection**: X-Frame-Options and CSP frame-ancestors

---

## Authentication & Authorization

### Authentication Flow

1. **User Registration** (`POST /auth/signup`)
   - Email and password validation
   - Strong password requirements enforced
   - User profile creation with default permissions

2. **User Login** (`POST /auth/signin`)
   - Credential verification
   - JWT token generation
   - Session tracking
   - Rate limiting (5 attempts per 15 minutes)

3. **Token Refresh** (`POST /auth/refresh`)
   - Automatic token rotation
   - Refresh token validation
   - Session validity check

4. **Logout** (`POST /auth/signout`)
   - Single session logout
   - Option to logout all sessions

### Authorization Middleware

#### `authenticateUser`
Requires valid JWT token for access.

```javascript
import { authenticateUser } from './middleware/auth.js';
app.get('/api/protected', authenticateUser, handler);
```

#### `requireRole(role)`
Requires specific role (e.g., 'admin', 'user').

```javascript
import { requireRole } from './middleware/auth.js';
app.delete('/api/admin/data', authenticateUser, requireRole('admin'), handler);
```

#### `requirePermission(permission)`
Requires specific permission (fine-grained access control).

```javascript
import { requirePermission } from './middleware/auth.js';
app.post('/api/content', authenticateUser, requirePermission('create_content'), handler);
```

---

## Session Management

### Session Security Features

- **Concurrent Session Limit**: Maximum 5 active sessions per user
- **Session Timeout**: 24-hour session expiration
- **Absolute Timeout**: 7-day maximum session lifetime
- **Inactivity Timeout**: 30 minutes of inactivity triggers logout
- **Session Tracking**: IP address and user agent tracking
- **Session Revocation**: Ability to revoke individual or all sessions

### Session Endpoints

```javascript
GET    /auth/sessions          # Get all active sessions
DELETE /auth/sessions          # Logout all sessions
DELETE /auth/sessions/:id      # Revoke specific session
```

### Usage

```javascript
import { sessionSecurityMiddleware } from './middleware/sessionSecurity.js';
app.use(sessionSecurityMiddleware);
```

---

## Password Security

### Password Requirements

- **Minimum Length**: 12 characters
- **Maximum Length**: 128 characters
- **Complexity Requirements**:
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
  - At least one special character
- **Additional Checks**:
  - Minimum 5 unique characters
  - No common passwords
  - No sequential characters
  - No user information (email, name)
  - Password entropy calculation

### Usage

```javascript
import { passwordValidationMiddleware } from './middleware/passwordValidation.js';
app.post('/auth/signup', passwordValidationMiddleware, handler);
app.put('/auth/password', authenticateUser, passwordValidationMiddleware, handler);
```

### Password Validation Response

```json
{
  "success": false,
  "error": "WEAK_PASSWORD",
  "message": "Password does not meet security requirements",
  "details": {
    "errors": [
      "Password must be at least 12 characters long",
      "Password must contain at least one uppercase letter"
    ],
    "warnings": ["Password contains sequential characters"],
    "requirements": { ... }
  }
}
```

---

## CSRF Protection

### CSRF Implementation

CSRF protection is implemented using double-submit cookie pattern with server-side token validation.

### Usage

#### Generate CSRF Token
```javascript
import { generateCsrfToken } from './middleware/csrfProtection.js';
app.get('/form', generateCsrfToken, (req, res) => {
  res.json({ csrfToken: req.csrfToken });
});
```

#### Validate CSRF Token
```javascript
import { validateCsrfToken } from './middleware/csrfProtection.js';
app.post('/api/data', validateCsrfToken, handler);
```

#### Combined Protection
```javascript
import { csrfProtection } from './middleware/csrfProtection.js';
app.post('/api/data', csrfProtection, handler);
```

### Client-Side Integration

#### Include CSRF Token in Requests

**Option 1: Header**
```javascript
fetch('/api/data', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});
```

**Option 2: Body**
```javascript
const formData = new FormData();
formData.append('_csrf', csrfToken);
formData.append('data', value);
```

---

## File Upload Security

### File Upload Validation

- **File Size**: Maximum 10MB per file
- **File Count**: Maximum 5 files per upload
- **Allowed Types**: JPEG, PNG, GIF, WebP, SVG
- **MIME Type Verification**: Actual file content validation
- **Filename Sanitization**: Remove dangerous characters
- **Malware Scanning**: Pattern-based malicious content detection
- **Extension Validation**: Whitelist-based extension checking

### Forbidden Extensions

`.exe`, `.bat`, `.cmd`, `.sh`, `.bash`, `.php`, `.jsp`, `.asp`, `.aspx`, `.js`, `.jar`, `.py`, `.rb`, `.dll`, `.so`, `.dylib`

### Usage

```javascript
import { validateFileUpload } from './middleware/fileUploadSecurity.js';
app.post('/api/upload', validateFileUpload(), (req, res) => {
  const files = req.validatedFiles;
  // Process validated files
});
```

### Custom Configuration

```javascript
app.post('/api/upload', validateFileUpload({
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxFiles: 3,
  allowedMimeTypes: ['image/jpeg', 'image/png']
}), handler);
```

---

## PII Protection

### PII Filtering

Automatic filtering of personally identifiable information from logs and error messages.

### Filtered Information

- Email addresses
- Phone numbers
- Credit card numbers
- Social Security Numbers
- IP addresses
- JWT tokens
- API keys
- Passwords
- Session IDs
- Authorization headers

### Usage

#### Filter String
```javascript
import { filterPiiFromString } from './middleware/piiFilter.js';
const filtered = filterPiiFromString('User email: user@example.com');
// Result: 'User email: [EMAIL_REDACTED]'
```

#### Filter Object
```javascript
import { filterPiiFromObject } from './middleware/piiFilter.js';
const filtered = filterPiiFromObject({
  email: 'user@example.com',
  password: 'secret123',
  data: 'some data'
});
// Result: { email: '[EMAIL_REDACTED]', password: '[REDACTED]', data: 'some data' }
```

#### Safe Logger
```javascript
import { createPiiSafeLogger } from './middleware/piiFilter.js';
import winston from 'winston';

const logger = winston.createLogger({ ... });
const safeLogger = createPiiSafeLogger(logger);

safeLogger.info('User logged in', { email: 'user@example.com' });
// Logs: 'User logged in', { email: '[EMAIL_REDACTED]' }
```

---

## Security Headers

### Implemented Headers

| Header | Value | Purpose |
|--------|-------|---------|
| X-Content-Type-Options | nosniff | Prevent MIME type sniffing |
| X-Frame-Options | DENY | Prevent clickjacking |
| X-XSS-Protection | 1; mode=block | Enable XSS filter |
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | Enforce HTTPS |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | Restrict feature access |
| Content-Security-Policy | (see below) | Prevent XSS and data injection |

### Content Security Policy

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https: blob:;
font-src 'self' https://fonts.gstatic.com;
connect-src 'self' https://supabase.turklawai.com;
frame-src 'none';
object-src 'none';
```

---

## Rate Limiting

### Rate Limit Configuration

| Endpoint Type | Window | Max Requests |
|--------------|--------|--------------|
| General API | 15 minutes | 100 |
| Authentication | 15 minutes | 5 |
| Analysis | 1 minute | 10 |
| Password Reset | 1 hour | 3 |

### Custom Rate Limiting

```javascript
import rateLimit from 'express-rate-limit';

const customLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  message: 'Too many requests'
});

app.use('/api/custom', customLimiter);
```

---

## Security Configuration

### Environment Variables

#### Required (Production)

```env
# Database
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# Security
JWT_SECRET=your-jwt-secret-min-32-chars
ENCRYPTION_KEY=your-encryption-key-32-chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Server
NODE_ENV=production
SECURE_COOKIES=true
TRUST_PROXY=true
```

#### Optional Security Settings

```env
# Session
SESSION_TIMEOUT=86400000          # 24 hours
MAX_CONCURRENT_SESSIONS=5

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000       # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# File Upload
MAX_FILE_SIZE=10485760            # 10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp

# Cookie Domain
COOKIE_DOMAIN=.yourdomain.com
```

### Security Initialization

```javascript
import { initializeSecurity } from './middleware/securityConfig.js';

// On application startup
initializeSecurity();
```

---

## Deployment Security

### Docker Security

- **Non-root User**: Application runs as user `sanzo:1001`
- **Read-only Filesystem**: Where applicable
- **Health Checks**: Automatic health monitoring
- **Secrets Management**: Use Docker secrets or environment variables
- **Network Isolation**: Container network isolation

### Production Checklist

- [ ] All environment variables properly set
- [ ] HTTPS/TLS enabled
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CSRF protection enabled
- [ ] Session security configured
- [ ] PII filtering enabled
- [ ] File upload validation enabled
- [ ] Database Row-Level Security (RLS) enabled
- [ ] Regular security audits scheduled
- [ ] Dependency vulnerability scanning enabled
- [ ] Log monitoring and alerting configured
- [ ] Backup and recovery procedures tested
- [ ] Incident response plan documented

### Database Security (Supabase)

#### Row-Level Security Policies

```sql
-- Users can only view/update their own profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Color analyses restricted to owner
CREATE POLICY "Users can view own analyses"
  ON color_analyses FOR SELECT
  USING (auth.uid() = user_id);
```

---

## Security Best Practices

### For Developers

1. **Never commit secrets** to version control
2. **Always validate and sanitize** user inputs
3. **Use parameterized queries** for database operations
4. **Implement proper error handling** without exposing system details
5. **Keep dependencies updated** and scan for vulnerabilities
6. **Use HTTPS everywhere** in production
7. **Implement logging and monitoring** for security events
8. **Follow principle of least privilege** for access control
9. **Conduct security code reviews** for sensitive changes
10. **Test security controls** regularly

### For System Administrators

1. **Regular security updates** for all system components
2. **Monitor and analyze logs** for suspicious activities
3. **Implement backup and disaster recovery** procedures
4. **Use strong, unique passwords** for all accounts
5. **Enable multi-factor authentication** where possible
6. **Restrict network access** using firewalls and security groups
7. **Regular security assessments** and penetration testing
8. **Incident response plan** documentation and testing
9. **Security awareness training** for all team members
10. **Compliance with data protection** regulations (GDPR, CCPA, etc.)

---

## Incident Response

### Security Incident Procedure

1. **Detection**: Identify and confirm security incident
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat and vulnerabilities
4. **Recovery**: Restore systems to normal operation
5. **Post-Incident**: Document lessons learned and improve

### Emergency Contacts

- **Security Team**: security@yourdomain.com
- **System Admin**: admin@yourdomain.com
- **Emergency Hotline**: [Your emergency number]

### Reporting Security Vulnerabilities

If you discover a security vulnerability, please report it to:

- **Email**: security@yourdomain.com
- **PGP Key**: [Your PGP key fingerprint]

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested remediation

We aim to respond within 24 hours and will keep you informed of progress.

---

## Security Updates

### Version History

#### v1.0.0 (Current)
- Removed dangerous development auth bypass
- Implemented strong password validation
- Added CSRF protection
- Enhanced file upload security
- Implemented PII filtering
- Added session management controls
- Comprehensive security configuration

### Planned Enhancements

- [ ] Integration with Have I Been Pwned API for password breach checking
- [ ] Two-factor authentication (2FA) support
- [ ] Advanced malware scanning for file uploads
- [ ] Real-time security event monitoring dashboard
- [ ] Automated security testing in CI/CD pipeline
- [ ] Security information and event management (SIEM) integration

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/auth/row-level-security)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

---

## License

This security documentation is part of the Sanzo Color Advisor project.

**Last Updated**: 2025-11-11
**Maintained By**: Security Team

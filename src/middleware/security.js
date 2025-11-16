/**
 * Security Middleware for Production Environment
 * Validates critical security settings and configurations
 */

/**
 * Production environment validator
 * Ensures critical environment variables are properly configured
 */
export function validateProductionEnv(req, res, next) {
  // Only run in production
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const securityIssues = [];

  // Check critical environment variables
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    securityIssues.push('JWT_SECRET must be set and at least 32 characters');
  }

  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length < 32) {
    securityIssues.push('ENCRYPTION_KEY must be set and at least 32 characters');
  }

  if (!process.env.REACT_APP_SUPABASE_URL) {
    securityIssues.push('REACT_APP_SUPABASE_URL must be set');
  }

  if (!process.env.REACT_APP_SUPABASE_ANON_KEY) {
    securityIssues.push('REACT_APP_SUPABASE_ANON_KEY must be set');
  }

  if (!process.env.SUPABASE_SERVICE_KEY) {
    securityIssues.push('SUPABASE_SERVICE_KEY must be set');
  }

  // Check dangerous development settings
  if (process.env.BYPASS_AUTH === 'true') {
    securityIssues.push('BYPASS_AUTH must not be enabled in production');
  }

  if (process.env.TRUST_PROXY !== 'true' && process.env.TRUST_PROXY !== '1') {
    console.warn('⚠️  TRUST_PROXY is not enabled. This may cause issues with rate limiting behind a proxy.');
  }

  // If there are security issues, prevent server startup
  if (securityIssues.length > 0) {
    console.error('\n🚨 CRITICAL SECURITY CONFIGURATION ERRORS:');
    securityIssues.forEach(issue => console.error(`   ❌ ${issue}`));
    console.error('\n   Server startup aborted for security reasons.\n');

    return res.status(500).json({
      success: false,
      error: 'SECURITY_CONFIGURATION_ERROR',
      message: 'Server misconfigured. Check logs for details.'
    });
  }

  next();
}

/**
 * Security headers middleware
 * Adds additional security headers beyond helmet
 */
export function securityHeaders(req, res, next) {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy (formerly Feature-Policy)
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  // In production, enforce HTTPS
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  next();
}

/**
 * Request sanitization middleware
 * Prevents common injection attacks
 */
export function sanitizeRequest(req, res, next) {
  // Check for SQL injection patterns in query parameters
  const sqlInjectionPatterns = [
    /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)(\s|$)/i,
    /(union.*select)/i,
    /(\/\*|\*\/|--)/,
    /('|")(.*)(or|and)(\s+)(.*)('|")/i
  ];

  // Check query parameters
  for (const [key, value] of Object.entries(req.query)) {
    if (typeof value === 'string') {
      for (const pattern of sqlInjectionPatterns) {
        if (pattern.test(value)) {
          console.warn(`🚨 Possible SQL injection attempt detected in query param: ${key}`);
          return res.status(400).json({
            success: false,
            error: 'INVALID_REQUEST',
            message: 'Invalid characters detected in request'
          });
        }
      }
    }
  }

  // Check for XSS patterns in request body
  if (req.body && typeof req.body === 'object') {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi
    ];

    const checkForXSS = (obj) => {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
          for (const pattern of xssPatterns) {
            if (pattern.test(value)) {
              console.warn(`🚨 Possible XSS attempt detected in body field: ${key}`);
              return true;
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          if (checkForXSS(value)) return true;
        }
      }
      return false;
    };

    if (checkForXSS(req.body)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_REQUEST',
        message: 'Invalid content detected in request'
      });
    }
  }

  next();
}

/**
 * Rate limit info middleware
 * Adds rate limit information to response headers
 */
export function rateLimitInfo(req, res, next) {
  const limit = req.rateLimit?.max || 100;
  const windowMs = req.rateLimit?.windowMs || 900000;

  res.setHeader('X-RateLimit-Limit', limit);
  res.setHeader('X-RateLimit-Window', Math.floor(windowMs / 1000));

  next();
}

/**
 * IP logging middleware for security auditing
 */
export function ipAuditLog(req, res, next) {
  // Get real IP (considering proxy)
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
             req.headers['x-real-ip'] ||
             req.connection.remoteAddress;

  // Log suspicious patterns
  const suspiciousPatterns = [
    /\.\.\//,  // Directory traversal
    /etc\/passwd/i,
    /proc\/self/i,
    /%00/,  // Null byte
    /%2e%2e/i  // Encoded directory traversal
  ];

  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(fullUrl)) {
      console.error(`🚨 SECURITY ALERT: Suspicious request from ${ip}`);
      console.error(`   URL: ${fullUrl}`);
      console.error(`   User-Agent: ${req.headers['user-agent']}`);
    }
  }

  // Attach IP to request for later use
  req.clientIp = ip;

  next();
}

export default {
  validateProductionEnv,
  securityHeaders,
  sanitizeRequest,
  rateLimitInfo,
  ipAuditLog
};

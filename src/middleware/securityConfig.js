/**
 * Security Configuration and Environment Validation
 * Ensures all required security settings are properly configured
 */

import crypto from 'crypto';

/**
 * Required environment variables for security
 */
const REQUIRED_ENV_VARS = {
  production: [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'JWT_SECRET',
    'ALLOWED_ORIGINS',
    'NODE_ENV'
  ],
  development: [
    'REACT_APP_SUPABASE_URL',
    'REACT_APP_SUPABASE_ANON_KEY',
    'NODE_ENV'
  ]
};

/**
 * Security configuration defaults
 */
export const SECURITY_CONFIG = {
  // Session management
  session: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    refreshThreshold: 15 * 60 * 1000, // Refresh if less than 15 minutes remaining
    maxConcurrentSessions: 5,
    absoluteTimeout: 7 * 24 * 60 * 60 * 1000 // 7 days max session lifetime
  },

  // Rate limiting
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // Max requests per window
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: 5 // Max auth attempts per window
    },
    analysis: {
      windowMs: 60 * 1000, // 1 minute
      max: 10 // Max analysis requests per minute
    },
    api: {
      windowMs: 60 * 1000,
      max: 60 // Max API requests per minute
    }
  },

  // Token security
  token: {
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '7d',
    rotateRefreshToken: true,
    signatureAlgorithm: 'HS256'
  },

  // Password policy
  password: {
    minLength: 12,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuseCount: 5, // Prevent reusing last 5 passwords
    expiryDays: 90, // Force password change every 90 days
    maxFailedAttempts: 5,
    lockoutDuration: 30 * 60 * 1000 // 30 minutes lockout
  },

  // CORS
  cors: {
    credentials: true,
    maxAge: 86400, // 24 hours
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
  },

  // Cookie security
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  },

  // File upload
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },

  // Content Security Policy
  csp: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", process.env.REACT_APP_SUPABASE_URL],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },

  // Security headers
  headers: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
  },

  // Audit logging
  audit: {
    enabled: true,
    logAuthEvents: true,
    logDataAccess: true,
    logConfigChanges: true,
    logSecurityEvents: true,
    retentionDays: 90
  }
};

/**
 * Validate environment configuration
 * @returns {Object} - Validation result
 */
export function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const requiredVars = REQUIRED_ENV_VARS[env] || REQUIRED_ENV_VARS.development;
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Check JWT secret strength in production
  if (env === 'production' && process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long');
    }
  }

  // Check if sensitive values are properly set
  if (env === 'production') {
    // Verify ALLOWED_ORIGINS is set
    if (!process.env.ALLOWED_ORIGINS) {
      warnings.push('ALLOWED_ORIGINS should be explicitly set in production');
    }

    // Verify encryption key is set
    if (!process.env.ENCRYPTION_KEY) {
      warnings.push('ENCRYPTION_KEY is not set - sensitive data encryption unavailable');
    }

    // Verify secure cookies are enabled
    if (process.env.SECURE_COOKIES !== 'true') {
      warnings.push('SECURE_COOKIES should be set to "true" in production');
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings,
    environment: env
  };
}

/**
 * Generate secure random key
 * @param {number} length - Key length in bytes
 * @returns {string} - Hex encoded key
 */
export function generateSecureKey(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Validate security headers configuration
 * @param {Object} headers - Headers object
 * @returns {Object} - Validation result
 */
export function validateSecurityHeaders(headers) {
  const required = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];

  const missing = required.filter(header => !headers[header]);
  const warnings = [];

  // Check HSTS in production
  if (process.env.NODE_ENV === 'production' && !headers['Strict-Transport-Security']) {
    warnings.push('Strict-Transport-Security header missing in production');
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  };
}

/**
 * Middleware to validate security configuration on startup
 */
export function validateSecurityConfig(req, res, next) {
  const envValidation = validateEnvironment();

  if (!envValidation.valid) {
    console.error('Security configuration validation failed:');
    console.error('Missing required environment variables:', envValidation.missing);

    if (process.env.NODE_ENV === 'production') {
      // In production, fail fast
      return res.status(500).json({
        success: false,
        error: 'SECURITY_CONFIG_ERROR',
        message: 'Server security configuration is incomplete'
      });
    } else {
      // In development, just warn
      console.warn('⚠️  Security warnings:', envValidation.warnings);
    }
  }

  next();
}

/**
 * Initialize security configuration
 * Call this on application startup
 */
export function initializeSecurity() {
  const validation = validateEnvironment();

  console.log('🔒 Initializing security configuration...');
  console.log(`Environment: ${validation.environment}`);

  if (!validation.valid) {
    console.error('❌ Security configuration validation failed:');
    console.error('Missing:', validation.missing);

    if (validation.environment === 'production') {
      throw new Error('Required security configuration missing. Cannot start in production mode.');
    }
  }

  if (validation.warnings.length > 0) {
    console.warn('⚠️  Security warnings:');
    validation.warnings.forEach(warning => console.warn(`  - ${warning}`));
  }

  // Generate missing keys in development
  if (validation.environment === 'development') {
    if (!process.env.JWT_SECRET) {
      const generatedSecret = generateSecureKey(32);
      console.warn('⚠️  JWT_SECRET not set. Generated temporary secret for development.');
      console.warn(`   Add to .env: JWT_SECRET=${generatedSecret}`);
      process.env.JWT_SECRET = generatedSecret;
    }

    if (!process.env.ENCRYPTION_KEY) {
      const generatedKey = generateSecureKey(32);
      console.warn('⚠️  ENCRYPTION_KEY not set. Generated temporary key for development.');
      console.warn(`   Add to .env: ENCRYPTION_KEY=${generatedKey}`);
      process.env.ENCRYPTION_KEY = generatedKey;
    }
  }

  console.log('✅ Security configuration initialized');

  return {
    success: validation.valid,
    config: SECURITY_CONFIG,
    validation
  };
}

/**
 * Get security configuration for client
 * Returns safe-to-expose configuration values
 */
export function getClientSecurityConfig() {
  return {
    password: {
      minLength: SECURITY_CONFIG.password.minLength,
      requireUppercase: SECURITY_CONFIG.password.requireUppercase,
      requireLowercase: SECURITY_CONFIG.password.requireLowercase,
      requireNumbers: SECURITY_CONFIG.password.requireNumbers,
      requireSpecialChars: SECURITY_CONFIG.password.requireSpecialChars
    },
    session: {
      maxAge: SECURITY_CONFIG.session.maxAge,
      refreshThreshold: SECURITY_CONFIG.session.refreshThreshold
    },
    upload: {
      maxFileSize: SECURITY_CONFIG.upload.maxFileSize,
      maxFiles: SECURITY_CONFIG.upload.maxFiles,
      allowedTypes: SECURITY_CONFIG.upload.allowedTypes
    }
  };
}

/**
 * Middleware to add security headers
 */
export function addSecurityHeaders(req, res, next) {
  Object.entries(SECURITY_CONFIG.headers).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
  next();
}

/**
 * Check if running in secure mode
 */
export function isSecureMode() {
  return process.env.NODE_ENV === 'production' &&
         process.env.SECURE_COOKIES === 'true';
}

/**
 * Validate origin against whitelist
 */
export function isOriginAllowed(origin) {
  if (!origin) return false;

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim());

  return allowedOrigins.includes(origin) ||
         allowedOrigins.includes('*');
}

export default {
  SECURITY_CONFIG,
  validateEnvironment,
  generateSecureKey,
  validateSecurityHeaders,
  validateSecurityConfig,
  initializeSecurity,
  getClientSecurityConfig,
  addSecurityHeaders,
  isSecureMode,
  isOriginAllowed
};

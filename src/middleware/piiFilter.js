/**
 * PII (Personally Identifiable Information) Filter
 * Removes or masks sensitive information from logs and error messages
 */

/**
 * PII patterns to detect and mask
 */
const PII_PATTERNS = {
  // Email addresses
  email: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: '[EMAIL_REDACTED]'
  },

  // Phone numbers (various formats)
  phone: {
    pattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    replacement: '[PHONE_REDACTED]'
  },

  // Credit card numbers
  creditCard: {
    pattern: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g,
    replacement: '[CARD_REDACTED]'
  },

  // Social Security Numbers (US)
  ssn: {
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacement: '[SSN_REDACTED]'
  },

  // IP addresses (both IPv4 and IPv6)
  ipv4: {
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    replacement: '[IP_REDACTED]'
  },
  ipv6: {
    pattern: /\b(?:[A-Fa-f0-9]{1,4}:){7}[A-Fa-f0-9]{1,4}\b/g,
    replacement: '[IP_REDACTED]'
  },

  // JWT tokens (Bearer tokens)
  jwtToken: {
    pattern: /\b[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g,
    replacement: '[TOKEN_REDACTED]'
  },

  // API keys (common patterns)
  apiKey: {
    pattern: /\b(?:api[_-]?key|apikey|access[_-]?token)[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/gi,
    replacement: 'api_key=[KEY_REDACTED]'
  },

  // Passwords (in URLs or form data)
  password: {
    pattern: /\b(?:password|passwd|pwd)[:=]\s*['"]?([^'"\s&]+)['"]?/gi,
    replacement: 'password=[PASSWORD_REDACTED]'
  },

  // Authorization headers
  authHeader: {
    pattern: /\b(?:Authorization|auth):\s*(?:Bearer|Basic)\s+[A-Za-z0-9+/=._-]+/gi,
    replacement: 'Authorization: [AUTH_REDACTED]'
  },

  // Session IDs
  sessionId: {
    pattern: /\b(?:session[_-]?id|sessionid|sess)[:=]\s*['"]?([A-Za-z0-9_\-]{20,})['"]?/gi,
    replacement: 'session_id=[SESSION_REDACTED]'
  },

  // Names (basic pattern - may need refinement)
  // This is conservative to avoid false positives
  fullName: {
    pattern: /\b(?:name|full[_-]?name|username)[:=]\s*['"]?([A-Z][a-z]+\s+[A-Z][a-z]+)['"]?/g,
    replacement: 'name=[NAME_REDACTED]'
  }
};

/**
 * Sensitive field names to redact in objects
 */
const SENSITIVE_FIELDS = [
  'password',
  'passwd',
  'pwd',
  'secret',
  'token',
  'api_key',
  'apiKey',
  'access_token',
  'accessToken',
  'refresh_token',
  'refreshToken',
  'private_key',
  'privateKey',
  'credit_card',
  'creditCard',
  'ssn',
  'social_security',
  'cvv',
  'pin',
  'authorization',
  'auth',
  'session_id',
  'sessionId'
];

/**
 * Mask a string value
 * @param {string} value - Value to mask
 * @param {number} visibleChars - Number of characters to show
 * @returns {string} - Masked value
 */
function maskValue(value, visibleChars = 4) {
  if (!value || value.length <= visibleChars) {
    return '[REDACTED]';
  }

  const visible = value.substring(0, visibleChars);
  return `${visible}${'*'.repeat(Math.min(value.length - visibleChars, 10))}`;
}

/**
 * Filter PII from a string
 * @param {string} text - Text to filter
 * @param {Object} options - Filter options
 * @returns {string} - Filtered text
 */
export function filterPiiFromString(text, options = {}) {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filtered = text;

  // Apply all PII patterns
  for (const [key, config] of Object.entries(PII_PATTERNS)) {
    if (options[key] !== false) { // Allow disabling specific filters
      filtered = filtered.replace(config.pattern, config.replacement);
    }
  }

  return filtered;
}

/**
 * Filter PII from an object (recursive)
 * @param {Object} obj - Object to filter
 * @param {Object} options - Filter options
 * @returns {Object} - Filtered object
 */
export function filterPiiFromObject(obj, options = {}) {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map(item => filterPiiFromObject(item, options));
  }

  // Handle objects
  const filtered = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();

    // Check if field is sensitive
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      filtered[key] = '[REDACTED]';
      continue;
    }

    // Recursively filter nested objects
    if (value && typeof value === 'object') {
      filtered[key] = filterPiiFromObject(value, options);
    }
    // Filter strings
    else if (typeof value === 'string') {
      filtered[key] = filterPiiFromString(value, options);
    }
    // Keep other values as-is
    else {
      filtered[key] = value;
    }
  }

  return filtered;
}

/**
 * Filter PII from error objects
 * @param {Error} error - Error object
 * @returns {Object} - Sanitized error object
 */
export function filterPiiFromError(error) {
  if (!error) {
    return error;
  }

  const sanitized = {
    name: error.name,
    message: filterPiiFromString(error.message || ''),
    code: error.code
  };

  // Filter stack trace
  if (error.stack) {
    sanitized.stack = filterPiiFromString(error.stack);
  }

  // Filter additional properties
  if (error.details) {
    sanitized.details = filterPiiFromObject(error.details);
  }

  return sanitized;
}

/**
 * Express middleware to filter PII from request logs
 */
export function piiFilterMiddleware(req, res, next) {
  // Store original methods
  const originalSend = res.send;
  const originalJson = res.json;

  // Override send method
  res.send = function (data) {
    if (typeof data === 'string') {
      data = filterPiiFromString(data);
    }
    return originalSend.call(this, data);
  };

  // Override json method
  res.json = function (data) {
    if (data && typeof data === 'object') {
      data = filterPiiFromObject(data);
    }
    return originalJson.call(this, data);
  };

  // Filter request body for logging
  if (req.body && typeof req.body === 'object') {
    req.sanitizedBody = filterPiiFromObject(req.body);
  }

  // Filter query parameters for logging
  if (req.query && typeof req.query === 'object') {
    req.sanitizedQuery = filterPiiFromObject(req.query);
  }

  // Mask Authorization header
  if (req.headers.authorization) {
    req.sanitizedHeaders = {
      ...req.headers,
      authorization: maskValue(req.headers.authorization, 10)
    };
  }

  next();
}

/**
 * Create a sanitized logger wrapper
 * @param {Object} logger - Original logger instance (e.g., Winston)
 * @returns {Object} - Wrapped logger with PII filtering
 */
export function createPiiSafeLogger(logger) {
  const wrappedLogger = {};

  // Wrap each logging method
  ['error', 'warn', 'info', 'debug', 'log'].forEach(level => {
    if (typeof logger[level] === 'function') {
      wrappedLogger[level] = function (...args) {
        // Filter all arguments
        const sanitizedArgs = args.map(arg => {
          if (typeof arg === 'string') {
            return filterPiiFromString(arg);
          } else if (arg instanceof Error) {
            return filterPiiFromError(arg);
          } else if (typeof arg === 'object') {
            return filterPiiFromObject(arg);
          }
          return arg;
        });

        return logger[level](...sanitizedArgs);
      };
    }
  });

  return wrappedLogger;
}

/**
 * Sanitize URL for logging (remove sensitive query parameters)
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
export function sanitizeUrl(url) {
  if (!url) {
    return url;
  }

  try {
    const urlObj = new URL(url, 'http://dummy.com');
    const params = urlObj.searchParams;

    // Sensitive query parameters
    const sensitiveParams = [
      'token', 'access_token', 'api_key', 'apikey',
      'password', 'pwd', 'secret', 'auth',
      'session', 'sessionid', 'jwt'
    ];

    // Mask sensitive parameters
    sensitiveParams.forEach(param => {
      if (params.has(param)) {
        params.set(param, '[REDACTED]');
      }
    });

    return urlObj.pathname + urlObj.search;
  } catch (error) {
    // If URL parsing fails, filter as string
    return filterPiiFromString(url);
  }
}

/**
 * Get safe logging data from request
 * @param {Object} req - Express request object
 * @returns {Object} - Safe logging data
 */
export function getSafeRequestData(req) {
  return {
    method: req.method,
    url: sanitizeUrl(req.originalUrl || req.url),
    ip: maskValue(req.ip || req.connection?.remoteAddress || 'unknown', 2),
    userAgent: req.headers['user-agent'],
    userId: req.user?.id ? maskValue(req.user.id, 8) : undefined,
    timestamp: new Date().toISOString(),
    requestId: req.id || req.headers['x-request-id']
  };
}

/**
 * Middleware to add request logging with PII filtering
 */
export function safeRequestLogger(logger) {
  return (req, res, next) => {
    const startTime = Date.now();

    // Log request
    const requestData = getSafeRequestData(req);
    logger.info('Incoming request', requestData);

    // Log response
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      logger.info('Request completed', {
        ...requestData,
        statusCode: res.statusCode,
        duration: `${duration}ms`
      });
    });

    next();
  };
}

export default {
  filterPiiFromString,
  filterPiiFromObject,
  filterPiiFromError,
  piiFilterMiddleware,
  createPiiSafeLogger,
  sanitizeUrl,
  getSafeRequestData,
  safeRequestLogger,
  maskValue,
  PII_PATTERNS,
  SENSITIVE_FIELDS
};

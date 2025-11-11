/**
 * CSRF Protection Middleware
 * Protects against Cross-Site Request Forgery attacks
 */

import crypto from 'crypto';

/**
 * In-memory token store (for development)
 * In production, use Redis or similar distributed cache
 */
const tokenStore = new Map();

/**
 * Token configuration
 */
const CSRF_CONFIG = {
  tokenLength: 32,
  tokenExpiry: 3600000, // 1 hour in milliseconds
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600000 // 1 hour
  }
};

/**
 * Generate a cryptographically secure random token
 * @returns {string} - Random token
 */
function generateToken() {
  return crypto.randomBytes(CSRF_CONFIG.tokenLength).toString('hex');
}

/**
 * Store token with expiry
 * @param {string} token - CSRF token
 * @param {string} userId - User ID (optional for session-based tokens)
 */
function storeToken(token, userId = 'anonymous') {
  const expiry = Date.now() + CSRF_CONFIG.tokenExpiry;
  tokenStore.set(token, { userId, expiry });

  // Clean up expired tokens periodically
  if (tokenStore.size > 10000) {
    cleanupExpiredTokens();
  }
}

/**
 * Verify token is valid and not expired
 * @param {string} token - CSRF token to verify
 * @param {string} userId - User ID to match against
 * @returns {boolean} - True if valid
 */
function verifyToken(token, userId = 'anonymous') {
  const stored = tokenStore.get(token);

  if (!stored) {
    return false;
  }

  // Check if expired
  if (Date.now() > stored.expiry) {
    tokenStore.delete(token);
    return false;
  }

  // Verify userId matches (optional, for additional security)
  if (stored.userId !== userId && stored.userId !== 'anonymous') {
    return false;
  }

  return true;
}

/**
 * Remove token from store
 * @param {string} token - Token to remove
 */
function removeToken(token) {
  tokenStore.delete(token);
}

/**
 * Clean up expired tokens
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [token, data] of tokenStore.entries()) {
    if (now > data.expiry) {
      tokenStore.delete(token);
    }
  }
}

/**
 * Middleware to generate and set CSRF token
 * Should be applied to routes that render forms or need CSRF protection
 */
export function generateCsrfToken(req, res, next) {
  try {
    // Generate new token
    const token = generateToken();
    const userId = req.user?.id || 'anonymous';

    // Store token
    storeToken(token, userId);

    // Set cookie
    res.cookie(CSRF_CONFIG.cookieName, token, CSRF_CONFIG.cookieOptions);

    // Attach to request for use in templates
    req.csrfToken = token;

    // Also send in response header for SPA applications
    res.set('X-CSRF-Token', token);

    next();
  } catch (error) {
    console.error('CSRF token generation error:', error);
    return res.status(500).json({
      success: false,
      error: 'CSRF_TOKEN_GENERATION_ERROR',
      message: 'Failed to generate CSRF token'
    });
  }
}

/**
 * Middleware to validate CSRF token on state-changing operations
 * Should be applied to POST, PUT, DELETE, PATCH routes
 */
export function validateCsrfToken(req, res, next) {
  try {
    // Skip CSRF validation for GET, HEAD, OPTIONS requests
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return next();
    }

    // Get token from header or body
    const token = req.headers[CSRF_CONFIG.headerName] ||
                  req.body?._csrf ||
                  req.query?._csrf;

    // Get expected token from cookie
    const cookieToken = req.cookies?.[CSRF_CONFIG.cookieName];

    if (!token) {
      return res.status(403).json({
        success: false,
        error: 'CSRF_TOKEN_MISSING',
        message: 'CSRF token is required for this operation'
      });
    }

    if (!cookieToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF_COOKIE_MISSING',
        message: 'CSRF cookie is missing'
      });
    }

    // Verify tokens match
    if (token !== cookieToken) {
      return res.status(403).json({
        success: false,
        error: 'CSRF_TOKEN_MISMATCH',
        message: 'CSRF token mismatch'
      });
    }

    // Verify token is valid and not expired
    const userId = req.user?.id || 'anonymous';
    if (!verifyToken(token, userId)) {
      return res.status(403).json({
        success: false,
        error: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token is invalid or expired'
      });
    }

    // Token is valid, continue
    next();
  } catch (error) {
    console.error('CSRF token validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'CSRF_VALIDATION_ERROR',
      message: 'Failed to validate CSRF token'
    });
  }
}

/**
 * Middleware to refresh CSRF token after successful validation
 * Prevents token reuse attacks
 */
export function refreshCsrfToken(req, res, next) {
  try {
    const oldToken = req.cookies?.[CSRF_CONFIG.cookieName];

    if (oldToken) {
      // Remove old token
      removeToken(oldToken);
    }

    // Generate new token
    generateCsrfToken(req, res, next);
  } catch (error) {
    console.error('CSRF token refresh error:', error);
    next();
  }
}

/**
 * Combined middleware for CSRF protection
 * Validates token and generates new one for next request
 */
export function csrfProtection(req, res, next) {
  validateCsrfToken(req, res, (err) => {
    if (err) {
      return next(err);
    }
    refreshCsrfToken(req, res, next);
  });
}

/**
 * Get CSRF token for current request
 * Utility function for use in route handlers
 */
export function getCsrfToken(req) {
  return req.csrfToken || req.cookies?.[CSRF_CONFIG.cookieName];
}

/**
 * Middleware to skip CSRF validation for specific routes
 * Use with caution and only for legitimate cases (e.g., webhooks)
 */
export function skipCsrfValidation(req, res, next) {
  req.csrfSkipped = true;
  next();
}

/**
 * Conditional CSRF validation
 * Skips validation if explicitly skipped, otherwise validates
 */
export function conditionalCsrfValidation(req, res, next) {
  if (req.csrfSkipped) {
    return next();
  }
  validateCsrfToken(req, res, next);
}

/**
 * Clean up tokens periodically (call this in a cron job or interval)
 */
export function startTokenCleanup(intervalMs = 600000) { // Default: 10 minutes
  setInterval(() => {
    cleanupExpiredTokens();
  }, intervalMs);
}

export default {
  generateCsrfToken,
  validateCsrfToken,
  refreshCsrfToken,
  csrfProtection,
  getCsrfToken,
  skipCsrfValidation,
  conditionalCsrfValidation,
  startTokenCleanup,
  CSRF_CONFIG
};

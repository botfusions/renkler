/**
 * Authentication Middleware for Sanzo Color Advisor
 * Handles Supabase JWT verification and user session management
 */

import { supabase } from '../lib/supabase.js';

/**
 * Middleware to verify JWT token from Supabase
 * Extracts token from Authorization header or cookies
 */
export async function authenticateUser(req, res, next) {
  try {
    let token = null;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback: Extract token from cookies
    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    // Check if token is provided
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'ACCESS_TOKEN_REQUIRED',
        message: 'Authentication token is required'
      });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired authentication token'
      });
    }

    // Attach user to request object
    req.user = user;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_SERVER_ERROR',
      message: 'Authentication server error'
    });
  }
}

/**
 * Optional authentication middleware
 * Continues execution even if no valid token is provided
 */
export async function optionalAuth(req, res, next) {
  try {
    let token = null;

    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Fallback: Extract token from cookies
    if (!token && req.cookies && req.cookies.access_token) {
      token = req.cookies.access_token;
    }

    // If no token provided, continue without user
    if (!token) {
      req.user = null;
      req.token = null;
      return next();
    }

    // Try to verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      // Invalid token, but continue without user
      req.user = null;
      req.token = null;
    } else {
      // Valid token, attach user
      req.user = user;
      req.token = token;
    }

    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    // Continue without user on error
    req.user = null;
    req.token = null;
    next();
  }
}

/**
 * Role-based authorization middleware
 * Requires user to have specific role
 */
export function requireRole(requiredRole) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'User must be authenticated'
        });
      }

      // Get user profile with role information
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          error: 'USER_PROFILE_NOT_FOUND',
          message: 'User profile not found'
        });
      }

      // Check if user has required role
      if (profile.role !== requiredRole && profile.role !== 'admin') {
        return res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `Required role: ${requiredRole}`
        });
      }

      req.userProfile = profile;
      next();
    } catch (error) {
      console.error('Role authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'AUTH_SERVER_ERROR',
        message: 'Authorization server error'
      });
    }
  };
}

/**
 * Permission-based authorization middleware
 * Requires user to have specific permission
 */
export function requirePermission(requiredPermission) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'AUTHENTICATION_REQUIRED',
          message: 'User must be authenticated'
        });
      }

      // Get user profile with permissions
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, permissions')
        .eq('id', req.user.id)
        .single();

      if (error || !profile) {
        return res.status(403).json({
          success: false,
          error: 'USER_PROFILE_NOT_FOUND',
          message: 'User profile not found'
        });
      }

      // Admin has all permissions
      if (profile.role === 'admin') {
        req.userProfile = profile;
        return next();
      }

      // Check if user has required permission
      const permissions = profile.permissions || [];
      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          error: 'INSUFFICIENT_PERMISSIONS',
          message: `Required permission: ${requiredPermission}`
        });
      }

      req.userProfile = profile;
      next();
    } catch (error) {
      console.error('Permission authorization error:', error);
      return res.status(500).json({
        success: false,
        error: 'AUTH_SERVER_ERROR',
        message: 'Authorization server error'
      });
    }
  };
}

/**
 * Rate limiting middleware for authenticated users
 * Different limits for different user tiers
 */
export function userRateLimit(req, res, next) {
  try {
    if (!req.user) {
      // Apply guest rate limit
      req.rateLimit = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10 // 10 requests per window for guests
      };
    } else {
      // Apply authenticated user rate limit
      req.rateLimit = {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // 100 requests per window for authenticated users
      };
    }

    next();
  } catch (error) {
    console.error('User rate limit error:', error);
    next();
  }
}

/**
 * Validate API key for service-to-service communication
 */
export function validateApiKey(req, res, next) {
  try {
    const apiKey = req.headers['x-api-key'];
    const validApiKey = process.env.SUPABASE_SERVICE_KEY;

    if (!apiKey || !validApiKey) {
      return res.status(401).json({
        success: false,
        error: 'API_KEY_REQUIRED',
        message: 'Valid API key is required'
      });
    }

    if (apiKey !== validApiKey) {
      return res.status(401).json({
        success: false,
        error: 'INVALID_API_KEY',
        message: 'Invalid API key provided'
      });
    }

    req.isServiceRequest = true;
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'AUTH_SERVER_ERROR',
      message: 'API key validation error'
    });
  }
}

/**
 * CORS middleware with authentication awareness
 */
export function corsWithAuth(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',');

  // Allow requests from allowed origins
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }

  // Set other CORS headers
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key'
  );
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS, PATCH'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
}

/**
 * Session validation middleware
 * Ensures session is still valid and user exists
 */
export async function validateSession(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'NO_ACTIVE_SESSION',
        message: 'No active user session'
      });
    }

    // Check if user still exists in database
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !profile) {
      return res.status(401).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User account not found'
      });
    }

    // Attach profile to request
    req.userProfile = profile;
    next();
  } catch (error) {
    console.error('Session validation error:', error);
    return res.status(500).json({
      success: false,
      error: 'SESSION_VALIDATION_ERROR',
      message: 'Error validating user session'
    });
  }
}

/**
 * Development-only bypass middleware
 * Allows bypassing authentication in development mode
 */
export function devAuthBypass(req, res, next) {
  if (process.env.NODE_ENV === 'development' && process.env.BYPASS_AUTH === 'true') {
    // Create a mock user for development
    req.user = {
      id: 'dev-user-123',
      email: 'dev@sanzo-color-advisor.com',
      role: 'admin'
    };
    req.token = 'dev-token';
    console.warn('⚠️  Authentication bypassed for development');
  }
  next();
}

export default {
  authenticateUser,
  optionalAuth,
  requireRole,
  requirePermission,
  userRateLimit,
  validateApiKey,
  corsWithAuth,
  validateSession,
  devAuthBypass
};
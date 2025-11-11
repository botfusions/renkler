/**
 * Session Security Middleware
 * Enhanced session management with security controls
 */

import { supabase } from '../lib/supabase.js';

/**
 * Session security configuration
 */
const SESSION_CONFIG = {
  maxConcurrentSessions: 5,
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  absoluteTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days absolute max
  refreshThreshold: 15 * 60 * 1000, // Refresh if < 15 minutes remaining
  inactivityTimeout: 30 * 60 * 1000, // 30 minutes of inactivity
  rotateTokenOnRefresh: true
};

/**
 * In-memory session tracking
 * In production, use Redis or similar distributed cache
 */
const activeSessions = new Map();
const sessionActivity = new Map();

/**
 * Track session creation
 * @param {string} userId - User ID
 * @param {string} sessionId - Session ID
 * @param {Object} metadata - Session metadata
 */
export function trackSession(userId, sessionId, metadata = {}) {
  if (!activeSessions.has(userId)) {
    activeSessions.set(userId, new Set());
  }

  const userSessions = activeSessions.get(userId);
  userSessions.add(sessionId);

  // Track session metadata
  sessionActivity.set(sessionId, {
    userId,
    createdAt: Date.now(),
    lastActivity: Date.now(),
    ipAddress: metadata.ipAddress,
    userAgent: metadata.userAgent,
    valid: true
  });

  // Enforce concurrent session limit
  if (userSessions.size > SESSION_CONFIG.maxConcurrentSessions) {
    // Remove oldest sessions
    const sessions = Array.from(userSessions);
    const sessionsToRemove = sessions
      .sort((a, b) => {
        const aActivity = sessionActivity.get(a)?.lastActivity || 0;
        const bActivity = sessionActivity.get(b)?.lastActivity || 0;
        return aActivity - bActivity;
      })
      .slice(0, userSessions.size - SESSION_CONFIG.maxConcurrentSessions);

    sessionsToRemove.forEach(sid => {
      invalidateSession(sid);
    });
  }
}

/**
 * Update session activity
 * @param {string} sessionId - Session ID
 */
export function updateSessionActivity(sessionId) {
  const session = sessionActivity.get(sessionId);
  if (session) {
    session.lastActivity = Date.now();
  }
}

/**
 * Invalidate a session
 * @param {string} sessionId - Session ID to invalidate
 */
export function invalidateSession(sessionId) {
  const session = sessionActivity.get(sessionId);
  if (session) {
    session.valid = false;

    const userSessions = activeSessions.get(session.userId);
    if (userSessions) {
      userSessions.delete(sessionId);
    }

    sessionActivity.delete(sessionId);
  }
}

/**
 * Invalidate all sessions for a user
 * @param {string} userId - User ID
 */
export function invalidateAllUserSessions(userId) {
  const userSessions = activeSessions.get(userId);
  if (userSessions) {
    userSessions.forEach(sessionId => {
      invalidateSession(sessionId);
    });
    activeSessions.delete(userId);
  }
}

/**
 * Check if session is valid and not expired
 * @param {string} sessionId - Session ID
 * @returns {Object} - Validation result
 */
export function validateSessionSecurity(sessionId) {
  const session = sessionActivity.get(sessionId);

  if (!session) {
    return {
      valid: false,
      reason: 'SESSION_NOT_FOUND'
    };
  }

  if (!session.valid) {
    return {
      valid: false,
      reason: 'SESSION_INVALIDATED'
    };
  }

  const now = Date.now();

  // Check absolute timeout
  if (now - session.createdAt > SESSION_CONFIG.absoluteTimeout) {
    invalidateSession(sessionId);
    return {
      valid: false,
      reason: 'SESSION_EXPIRED_ABSOLUTE'
    };
  }

  // Check inactivity timeout
  if (now - session.lastActivity > SESSION_CONFIG.inactivityTimeout) {
    invalidateSession(sessionId);
    return {
      valid: false,
      reason: 'SESSION_EXPIRED_INACTIVITY'
    };
  }

  // Check regular session timeout
  if (now - session.createdAt > SESSION_CONFIG.sessionTimeout) {
    return {
      valid: true,
      shouldRefresh: true,
      reason: 'SESSION_NEEDS_REFRESH'
    };
  }

  // Check if approaching expiry
  const timeRemaining = SESSION_CONFIG.sessionTimeout - (now - session.createdAt);
  if (timeRemaining < SESSION_CONFIG.refreshThreshold) {
    return {
      valid: true,
      shouldRefresh: true,
      reason: 'SESSION_NEAR_EXPIRY',
      timeRemaining
    };
  }

  return {
    valid: true,
    shouldRefresh: false
  };
}

/**
 * Middleware to validate and refresh sessions
 */
export async function sessionSecurityMiddleware(req, res, next) {
  try {
    // Skip if no user authenticated
    if (!req.user) {
      return next();
    }

    // Generate session ID from user ID and token
    const sessionId = `${req.user.id}_${req.token ? req.token.substring(0, 10) : 'unknown'}`;

    // Validate session
    const validation = validateSessionSecurity(sessionId);

    if (!validation.valid) {
      // Session is invalid, force logout
      return res.status(401).json({
        success: false,
        error: validation.reason,
        message: 'Session has expired or been invalidated',
        requiresLogin: true
      });
    }

    // Update activity
    updateSessionActivity(sessionId);

    // Check if session needs refresh
    if (validation.shouldRefresh) {
      // Add header to indicate refresh needed
      res.set('X-Session-Refresh-Required', 'true');

      if (validation.timeRemaining) {
        res.set('X-Session-Time-Remaining', validation.timeRemaining.toString());
      }
    }

    // Attach session info to request
    req.session = {
      id: sessionId,
      userId: req.user.id,
      valid: validation.valid,
      shouldRefresh: validation.shouldRefresh
    };

    next();
  } catch (error) {
    console.error('Session security middleware error:', error);
    next();
  }
}

/**
 * Middleware to track new session on login
 */
export function trackNewSession(req, res, next) {
  const originalJson = res.json.bind(res);

  res.json = function (data) {
    // If this is a successful login/signup response
    if (data.success && data.session && data.user) {
      const sessionId = `${data.user.id}_${data.session.access_token.substring(0, 10)}`;

      trackSession(data.user.id, sessionId, {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      // Add session info to response
      data.sessionInfo = {
        sessionId: sessionId,
        expiresIn: SESSION_CONFIG.sessionTimeout,
        maxSessions: SESSION_CONFIG.maxConcurrentSessions
      };
    }

    return originalJson(data);
  };

  next();
}

/**
 * Endpoint handler to logout all sessions
 */
export async function logoutAllSessions(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    // Invalidate all sessions
    invalidateAllUserSessions(req.user.id);

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Supabase signout error:', error);
    }

    return res.json({
      success: true,
      message: 'All sessions have been terminated'
    });
  } catch (error) {
    console.error('Logout all sessions error:', error);
    return res.status(500).json({
      success: false,
      error: 'LOGOUT_ERROR',
      message: 'Failed to logout all sessions'
    });
  }
}

/**
 * Get active sessions for a user
 */
export async function getActiveSessions(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    const userSessions = activeSessions.get(req.user.id);

    if (!userSessions || userSessions.size === 0) {
      return res.json({
        success: true,
        sessions: []
      });
    }

    const sessions = Array.from(userSessions).map(sessionId => {
      const activity = sessionActivity.get(sessionId);
      return {
        sessionId: sessionId.substring(0, 20) + '...', // Partial ID for security
        createdAt: new Date(activity.createdAt).toISOString(),
        lastActivity: new Date(activity.lastActivity).toISOString(),
        ipAddress: activity.ipAddress,
        userAgent: activity.userAgent,
        current: req.session?.id === sessionId
      };
    });

    return res.json({
      success: true,
      sessions,
      maxSessions: SESSION_CONFIG.maxConcurrentSessions
    });
  } catch (error) {
    console.error('Get active sessions error:', error);
    return res.status(500).json({
      success: false,
      error: 'SESSION_FETCH_ERROR',
      message: 'Failed to retrieve active sessions'
    });
  }
}

/**
 * Revoke a specific session
 */
export async function revokeSession(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'AUTHENTICATION_REQUIRED',
        message: 'User must be authenticated'
      });
    }

    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'SESSION_ID_REQUIRED',
        message: 'Session ID is required'
      });
    }

    // Verify session belongs to user
    const session = sessionActivity.get(sessionId);
    if (!session || session.userId !== req.user.id) {
      return res.status(404).json({
        success: false,
        error: 'SESSION_NOT_FOUND',
        message: 'Session not found or does not belong to user'
      });
    }

    // Invalidate session
    invalidateSession(sessionId);

    return res.json({
      success: true,
      message: 'Session has been revoked'
    });
  } catch (error) {
    console.error('Revoke session error:', error);
    return res.status(500).json({
      success: false,
      error: 'SESSION_REVOKE_ERROR',
      message: 'Failed to revoke session'
    });
  }
}

/**
 * Cleanup expired sessions periodically
 */
export function startSessionCleanup(intervalMs = 300000) { // 5 minutes
  setInterval(() => {
    const now = Date.now();

    for (const [sessionId, session] of sessionActivity.entries()) {
      // Check if session has expired
      if (
        now - session.createdAt > SESSION_CONFIG.absoluteTimeout ||
        now - session.lastActivity > SESSION_CONFIG.inactivityTimeout
      ) {
        invalidateSession(sessionId);
      }
    }
  }, intervalMs);
}

export default {
  trackSession,
  updateSessionActivity,
  invalidateSession,
  invalidateAllUserSessions,
  validateSessionSecurity,
  sessionSecurityMiddleware,
  trackNewSession,
  logoutAllSessions,
  getActiveSessions,
  revokeSession,
  startSessionCleanup,
  SESSION_CONFIG
};

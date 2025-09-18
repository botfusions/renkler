/**
 * Authentication Routes for Sanzo Color Advisor
 * Handles user registration, login, password reset, and OAuth callbacks
 */

import express from 'express';
import { supabase, auth, db } from '../lib/supabase.js';
import { authenticateUser, optionalAuth, validateSession } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many authentication attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many password reset attempts. Please try again later.'
  }
});

/**
 * POST /auth/signup
 * Register a new user account
 */
router.post('/signup', authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, languagePreference = 'tr' } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: 'Email and password are required'
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Register user with Supabase
    const { data, error } = await auth.signUp(email, password, {
      full_name: fullName,
      language_preference: languagePreference
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.code || 'SIGNUP_FAILED',
        message: error.message || 'Failed to create account'
      });
    }

    // Track analytics
    if (data.user) {
      await db.analytics.track({
        event_type: 'user_signup',
        event_data: {
          user_id: data.user.id,
          signup_method: 'email',
          language_preference: languagePreference
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          emailConfirmed: data.user?.email_confirmed_at ? true : false
        },
        session: data.session ? {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at
        } : null
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during signup'
    });
  }
});

/**
 * POST /auth/signin
 * Sign in with email and password
 */
router.post('/signin', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_CREDENTIALS',
        message: 'Email and password are required'
      });
    }

    // Attempt sign in
    const { data, error } = await auth.signIn(email, password);

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.code || 'SIGNIN_FAILED',
        message: error.message || 'Invalid credentials'
      });
    }

    // Get user profile
    let profile = null;
    if (data.user) {
      try {
        profile = await db.profiles.get(data.user.id);
      } catch (profileError) {
        console.warn('Could not fetch user profile:', profileError);
      }

      // Track analytics
      await db.analytics.track({
        event_type: 'user_signin',
        event_data: {
          user_id: data.user.id,
          signin_method: 'email'
        }
      });
    }

    res.json({
      success: true,
      message: 'Signed in successfully',
      data: {
        user: {
          id: data.user?.id,
          email: data.user?.email,
          ...profile
        },
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during signin'
    });
  }
});

/**
 * POST /auth/signout
 * Sign out current user
 */
router.post('/signout', authenticateUser, async (req, res) => {
  try {
    const { error } = await auth.signOut();

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.code || 'SIGNOUT_FAILED',
        message: error.message || 'Failed to sign out'
      });
    }

    // Track analytics
    await db.analytics.track({
      event_type: 'user_signout',
      event_data: {
        user_id: req.user.id
      }
    });

    res.json({
      success: true,
      message: 'Signed out successfully'
    });

  } catch (error) {
    console.error('Signout error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during signout'
    });
  }
});

/**
 * GET /auth/user
 * Get current user information
 */
router.get('/user', authenticateUser, validateSession, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          email: req.user.email,
          ...req.userProfile
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to fetch user information'
    });
  }
});

/**
 * PUT /auth/user
 * Update user profile
 */
router.put('/user', authenticateUser, validateSession, async (req, res) => {
  try {
    const { fullName, languagePreference, themePreference, accessibilitySettings } = req.body;

    const updates = {};
    if (fullName !== undefined) updates.full_name = fullName;
    if (languagePreference !== undefined) updates.language_preference = languagePreference;
    if (themePreference !== undefined) updates.theme_preference = themePreference;
    if (accessibilitySettings !== undefined) updates.accessibility_settings = accessibilitySettings;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'NO_UPDATES_PROVIDED',
        message: 'No valid updates provided'
      });
    }

    const updatedProfile = await db.profiles.update(req.user.id, updates);

    // Track analytics
    await db.analytics.track({
      event_type: 'profile_updated',
      event_data: {
        user_id: req.user.id,
        updated_fields: Object.keys(updates)
      }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedProfile
      }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to update user profile'
    });
  }
});

/**
 * POST /auth/reset-password
 * Request password reset
 */
router.post('/reset-password', passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'EMAIL_REQUIRED',
        message: 'Email address is required'
      });
    }

    const { error } = await auth.resetPassword(email);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.code || 'RESET_PASSWORD_FAILED',
        message: error.message || 'Failed to send reset email'
      });
    }

    // Track analytics (don't include email for privacy)
    await db.analytics.track({
      event_type: 'password_reset_requested',
      event_data: {
        timestamp: new Date().toISOString()
      }
    });

    res.json({
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during password reset'
    });
  }
});

/**
 * GET /auth/oauth/:provider
 * Initiate OAuth flow
 */
router.get('/oauth/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const validProviders = ['google', 'github'];

    if (!validProviders.includes(provider)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PROVIDER',
        message: 'Invalid OAuth provider'
      });
    }

    const { data, error } = await auth.signInWithProvider(provider);

    if (error) {
      return res.status(400).json({
        success: false,
        error: error.code || 'OAUTH_FAILED',
        message: error.message || 'OAuth authentication failed'
      });
    }

    // Redirect to OAuth provider
    if (data.url) {
      res.redirect(data.url);
    } else {
      res.status(400).json({
        success: false,
        error: 'OAUTH_URL_MISSING',
        message: 'OAuth URL not provided'
      });
    }

  } catch (error) {
    console.error('OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during OAuth'
    });
  }
});

/**
 * GET /auth/callback
 * Handle OAuth callback
 */
router.get('/callback', async (req, res) => {
  try {
    const { code, state, error: oauthError } = req.query;

    if (oauthError) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=${oauthError}`);
    }

    if (!code) {
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=missing_code`);
    }

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('OAuth callback error:', error);
      return res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=oauth_failed`);
    }

    // Track analytics
    if (data.user) {
      await db.analytics.track({
        event_type: 'oauth_signin',
        event_data: {
          user_id: data.user.id,
          provider: data.user.app_metadata?.provider || 'unknown'
        }
      });
    }

    // Redirect to frontend with session
    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/success`);
    if (data.session) {
      redirectUrl.searchParams.set('access_token', data.session.access_token);
      redirectUrl.searchParams.set('refresh_token', data.session.refresh_token);
    }

    res.redirect(redirectUrl.toString());

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/auth/error?error=server_error`);
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({
        success: false,
        error: 'REFRESH_TOKEN_REQUIRED',
        message: 'Refresh token is required'
      });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token
    });

    if (error) {
      return res.status(401).json({
        success: false,
        error: error.code || 'REFRESH_FAILED',
        message: error.message || 'Failed to refresh token'
      });
    }

    res.json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        session: {
          access_token: data.session?.access_token,
          refresh_token: data.session?.refresh_token,
          expires_at: data.session?.expires_at
        }
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Internal server error during token refresh'
    });
  }
});

export default router;
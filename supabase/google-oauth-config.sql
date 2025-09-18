-- Google OAuth Configuration for Self-hosted Supabase
-- This script configures Google OAuth provider for the self-hosted Supabase instance

-- Update auth.config table to enable Google OAuth
-- Note: This should be run with superuser privileges

-- Enable Google OAuth provider
INSERT INTO auth.providers (id, name, config) VALUES (
  'google',
  'Google',
  '{
    "enabled": true,
    "client_id": "YOUR_GOOGLE_CLIENT_ID_HERE",
    "client_secret": "YOUR_GOOGLE_CLIENT_SECRET_HERE",
    "redirect_uri": "https://supabase.turklawai.com/auth/v1/callback"
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  config = EXCLUDED.config;

-- Alternative: Update Supabase config via environment variables
-- Add these to your Supabase Docker/Kubernetes deployment:

/*
Environment Variables to Add:

GOTRUE_EXTERNAL_GOOGLE_ENABLED=true
GOTRUE_EXTERNAL_GOOGLE_CLIENT_ID=your_google_client_id
GOTRUE_EXTERNAL_GOOGLE_SECRET=your_google_client_secret
GOTRUE_EXTERNAL_GOOGLE_REDIRECT_URI=https://supabase.turklawai.com/auth/v1/callback

GOTRUE_EXTERNAL_GITHUB_ENABLED=true
GOTRUE_EXTERNAL_GITHUB_CLIENT_ID=your_github_client_id
GOTRUE_EXTERNAL_GITHUB_SECRET=your_github_client_secret
GOTRUE_EXTERNAL_GITHUB_REDIRECT_URI=https://supabase.turklawai.com/auth/v1/callback
*/

-- Update allowed redirect URLs for OAuth
UPDATE auth.config SET
  value = '["https://supabase.turklawai.com/auth/v1/callback", "http://localhost:3000/auth/callback", "https://localhost:3000/auth/callback"]'
WHERE key = 'GOTRUE_EXTERNAL_REDIRECT_URLS';

-- Ensure site URL is set correctly
UPDATE auth.config SET
  value = '"https://supabase.turklawai.com"'
WHERE key = 'GOTRUE_SITE_URL';

-- Add CORS allowed origins
UPDATE auth.config SET
  value = '["https://supabase.turklawai.com", "http://localhost:3000", "https://localhost:3000"]'
WHERE key = 'GOTRUE_EXTERNAL_CORS_ALLOWED_ORIGINS';

-- Google OAuth Setup Instructions:
/*
1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API and Google Identity API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen:
   - Application name: "Sanzo Color Advisor"
   - User support email: your-email@domain.com
   - Developer contact information: your-email@domain.com
6. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Name: Sanzo Color Advisor
   - Authorized JavaScript origins:
     * https://supabase.turklawai.com
     * http://localhost:3000 (for development)
   - Authorized redirect URIs:
     * https://supabase.turklawai.com/auth/v1/callback
     * http://localhost:3000/auth/callback (for development)
7. Copy Client ID and Client Secret
8. Update environment variables or run this SQL with actual values

Example .env configuration:
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
*/
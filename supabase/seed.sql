-- Supabase Seed Data for Sanzo Color Advisor
-- Creates admin user and initial data for testing and development

-- First, we need to insert into auth.users (this is usually done via Supabase Auth API)
-- But for development, we can create a seed admin user

-- Insert admin user into auth.users table (requires SUPABASE_SERVICE_KEY)
-- This should be run via Supabase SQL Editor or migration

-- Create admin profile (after user is created via Auth API)
-- Example admin user data:
/*
Admin User Credentials for Development:
Email: admin@sanzo-color-advisor.com
Password: SanzoAdmin2025!
Role: admin
*/

-- Insert admin profile (run this after creating user via Supabase Auth)
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  language_preference,
  theme_preference,
  accessibility_settings
) VALUES (
  '00000000-0000-0000-0000-000000000001', -- This should be replaced with actual user UUID from auth.users
  'admin@sanzo-color-advisor.com',
  'Sanzo Admin',
  'tr',
  'light',
  '{
    "high_contrast": false,
    "reduced_motion": false,
    "screen_reader": false,
    "large_text": false,
    "keyboard_navigation": true
  }'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  language_preference = EXCLUDED.language_preference,
  updated_at = now();

-- Create a test user profile
INSERT INTO public.profiles (
  id,
  email,
  full_name,
  language_preference,
  theme_preference,
  accessibility_settings
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- This should be replaced with actual user UUID
  'test@sanzo-color-advisor.com',
  'Test User',
  'tr',
  'light',
  '{}'::jsonb
) ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  language_preference = EXCLUDED.language_preference,
  updated_at = now();

-- Insert sample color analysis data
INSERT INTO public.color_analyses (
  id,
  user_id,
  analysis_type,
  room_type,
  base_colors,
  lighting_conditions,
  room_size,
  style_preference,
  recommended_colors,
  harmony_score,
  cultural_context,
  accessibility_notes,
  mood_analysis,
  analysis_duration_ms,
  confidence_score
) VALUES (
  uuid_generate_v4(),
  '00000000-0000-0000-0000-000000000002',
  'room',
  'living_room',
  '[
    {"hex": "#F5F5DC", "name": "Beige", "source": "wall"},
    {"hex": "#8B4513", "name": "Saddle Brown", "source": "furniture"},
    {"hex": "#2E8B57", "name": "Sea Green", "source": "accent"}
  ]'::jsonb,
  'natural',
  'medium',
  'modern',
  '[
    {
      "hex": "#F0E68C",
      "name": "Khaki",
      "reasoning": "Complements beige base while adding warmth",
      "application": "accent_wall",
      "confidence": 0.89
    },
    {
      "hex": "#CD853F",
      "name": "Peru",
      "reasoning": "Harmonizes with brown furniture",
      "application": "decorative_elements",
      "confidence": 0.85
    },
    {
      "hex": "#20B2AA",
      "name": "Light Sea Green",
      "reasoning": "Refreshes the green accent color",
      "application": "textiles",
      "confidence": 0.82
    }
  ]'::jsonb,
  0.87,
  '{
    "turkish_associations": {
      "beige": "Cappadocia stone",
      "brown": "Turkish coffee",
      "green": "Bosphorus nature"
    },
    "cultural_harmony": "Traditional Turkish interior style",
    "seasonal_fit": "All seasons"
  }'::jsonb,
  '{
    "protanopia_safe": true,
    "deuteranopia_safe": true,
    "tritanopia_safe": false,
    "contrast_ratio": 4.2,
    "notes": "Consider adding higher contrast for tritanopia users"
  }'::jsonb,
  '{
    "primary_mood": "calm",
    "energy_level": "moderate",
    "psychological_effects": ["relaxation", "warmth", "natural_connection"],
    "recommended_usage": "family_gathering_space"
  }'::jsonb,
  2341,
  0.89
);

-- Insert sample user favorites
INSERT INTO public.user_favorites (
  user_id,
  color_hex,
  color_name,
  category,
  notes
) VALUES
(
  '00000000-0000-0000-0000-000000000002',
  '#F5F5DC',
  'Beige',
  'wall',
  'Perfect for living room walls'
),
(
  '00000000-0000-0000-0000-000000000002',
  '#2E8B57',
  'Sea Green',
  'accent',
  'Love this for plant pots and cushions'
),
(
  '00000000-0000-0000-0000-000000000002',
  '#8B4513',
  'Saddle Brown',
  'furniture',
  'Great for wooden furniture'
);

-- Insert additional Turkish color trends
INSERT INTO public.color_trends (
  trend_name,
  colors,
  category,
  region,
  popularity_score,
  trend_start_date,
  description,
  sources
) VALUES
(
  'Anatolian Earth Tones 2025',
  '[
    {"hex": "#D2B48C", "name": "Tan", "description": "Warm earth tone from Anatolian plains"},
    {"hex": "#CD853F", "name": "Peru", "description": "Rich clay color from pottery traditions"},
    {"hex": "#A0522D", "name": "Sienna", "description": "Deep earth tone from ancient settlements"},
    {"hex": "#F4A460", "name": "Sandy Brown", "description": "Desert sand color from Central Anatolia"}
  ]'::jsonb,
  'interior',
  'turkey',
  0.91,
  '2025-01-01',
  'Earthy colors inspired by Anatolian landscapes and traditional crafts',
  '["Turkish Interior Design Association", "Traditional Craft Analysis", "Regional Color Studies"]'::jsonb
),
(
  'Istanbul Modern Blues 2025',
  '[
    {"hex": "#4682B4", "name": "Steel Blue", "description": "Modern interpretation of Bosphorus blue"},
    {"hex": "#5F9EA0", "name": "Cadet Blue", "description": "Contemporary urban blue tone"},
    {"hex": "#B0C4DE", "name": "Light Steel Blue", "description": "Soft blue for modern interiors"},
    {"hex": "#708090", "name": "Slate Gray", "description": "Industrial blue-gray for urban spaces"}
  ]'::jsonb,
  'interior',
  'turkey',
  0.83,
  '2025-01-01',
  'Modern blue palette inspired by contemporary Istanbul architecture',
  '["Istanbul Architecture Council", "Modern Turkish Design", "Urban Color Analysis"]'::jsonb
);

-- Insert sample analytics data (for testing dashboard)
INSERT INTO public.usage_analytics (
  user_id,
  session_id,
  event_type,
  event_data,
  user_agent,
  page_url,
  response_time_ms
) VALUES
(
  '00000000-0000-0000-0000-000000000002',
  'test_session_001',
  'analysis_started',
  '{"room_type": "living_room", "analysis_method": "color_picker"}'::jsonb,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'http://localhost:3000/color-analysis',
  150
),
(
  '00000000-0000-0000-0000-000000000002',
  'test_session_001',
  'analysis_completed',
  '{"analysis_id": "sample", "satisfaction_score": 4.5}'::jsonb,
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'http://localhost:3000/color-analysis',
  2341
),
(
  NULL, -- Anonymous user
  'anonymous_session_001',
  'analysis_started',
  '{"room_type": "bedroom", "analysis_method": "photo_upload"}'::jsonb,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  'http://localhost:3000/color-analysis',
  89
);

-- Update statistics in a comment for reference
/*
Seed Data Summary:
- 1 Admin profile (requires manual user creation via Supabase Auth)
- 1 Test user profile (requires manual user creation via Supabase Auth)
- 1 Sample color analysis with comprehensive data
- 3 User favorite colors
- 2 Additional Turkish color trends
- 3 Sample analytics events

To complete the setup:
1. Create admin user via Supabase Auth API or Dashboard:
   Email: admin@sanzo-color-advisor.com
   Password: SanzoAdmin2025!

2. Create test user via Supabase Auth API or Dashboard:
   Email: test@sanzo-color-advisor.com
   Password: TestUser2025!

3. Update the UUIDs in this file with the actual user IDs from auth.users

4. Run this seed file via Supabase SQL Editor
*/
-- Multi-Schema Database Setup for Self-hosted Supabase
-- Sanzo Color Advisor Schema for turklawai.com Supabase instance
-- Version: 1.0 - Self-hosted Compatible

-- Create dedicated schema for Sanzo Color Advisor
CREATE SCHEMA IF NOT EXISTS sanzo_color_advisor;

-- Set search path to include our schema
SET search_path TO sanzo_color_advisor, public, extensions;

-- Enable necessary extensions (if not already enabled globally)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

-- Create tables in sanzo_color_advisor schema

-- User profiles table (prefixed for multi-schema)
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  language_preference text DEFAULT 'tr' CHECK (language_preference IN ('tr', 'en')),
  theme_preference text DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto')),
  accessibility_settings jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT sanzo_profiles_email_check CHECK (char_length(email) >= 3)
);

-- Color analyses table
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_color_analyses (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES sanzo_color_advisor.sanzo_profiles(id) ON DELETE CASCADE NOT NULL,
  analysis_type text NOT NULL CHECK (analysis_type IN ('room', 'personal', 'brand', 'harmony')),
  room_type text CHECK (room_type IN ('living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining_room', 'other')),

  -- Input data
  base_colors jsonb NOT NULL,
  lighting_conditions text DEFAULT 'natural' CHECK (lighting_conditions IN ('natural', 'warm', 'cool', 'mixed')),
  room_size text CHECK (room_size IN ('small', 'medium', 'large')),
  style_preference text CHECK (style_preference IN ('modern', 'classic', 'minimalist', 'bohemian', 'traditional', 'eclectic')),

  -- AI generated results
  recommended_colors jsonb NOT NULL,
  harmony_score numeric(3,2) CHECK (harmony_score >= 0 AND harmony_score <= 1),
  cultural_context jsonb,
  accessibility_notes jsonb,
  mood_analysis jsonb,

  -- Metadata
  analysis_duration_ms integer,
  confidence_score numeric(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT sanzo_color_analyses_base_colors_check CHECK (jsonb_array_length(base_colors) > 0)
);

-- Room photos table
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_room_photos (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  analysis_id uuid REFERENCES sanzo_color_advisor.sanzo_color_analyses(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES sanzo_color_advisor.sanzo_profiles(id) ON DELETE CASCADE NOT NULL,

  -- File information
  file_name text NOT NULL,
  file_size integer NOT NULL CHECK (file_size > 0),
  file_type text NOT NULL CHECK (file_type IN ('image/jpeg', 'image/png', 'image/webp')),
  storage_path text NOT NULL UNIQUE,

  -- Image analysis results
  extracted_colors jsonb NOT NULL,
  dominant_colors jsonb NOT NULL,
  color_distribution jsonb,
  image_metadata jsonb,

  -- AI processing
  room_detection jsonb,
  lighting_analysis jsonb,
  processing_status text DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  processing_error text,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at timestamp with time zone,

  CONSTRAINT sanzo_room_photos_extracted_colors_check CHECK (jsonb_array_length(extracted_colors) > 0)
);

-- User favorite colors
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_user_favorites (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES sanzo_color_advisor.sanzo_profiles(id) ON DELETE CASCADE NOT NULL,
  color_hex text NOT NULL CHECK (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  color_name text NOT NULL,
  category text CHECK (category IN ('wall', 'accent', 'furniture', 'decor', 'personal')),
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  UNIQUE(user_id, color_hex)
);

-- Color trends tracking
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_color_trends (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  trend_name text NOT NULL,
  colors jsonb NOT NULL,
  category text NOT NULL CHECK (category IN ('seasonal', 'interior', 'fashion', 'brand', 'cultural')),
  region text DEFAULT 'global' CHECK (region IN ('global', 'turkey', 'europe', 'asia')),

  -- Trend data
  popularity_score numeric(3,2) CHECK (popularity_score >= 0 AND popularity_score <= 1),
  trend_start_date date,
  trend_end_date date,
  description text,
  sources jsonb,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,

  CONSTRAINT sanzo_color_trends_dates_check CHECK (trend_end_date IS NULL OR trend_end_date >= trend_start_date)
);

-- Analytics and usage tracking
CREATE TABLE IF NOT EXISTS sanzo_color_advisor.sanzo_usage_analytics (
  id uuid DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  user_id uuid REFERENCES sanzo_color_advisor.sanzo_profiles(id) ON DELETE SET NULL,
  session_id text NOT NULL,

  -- Event data
  event_type text NOT NULL CHECK (event_type IN (
    'analysis_started', 'analysis_completed', 'photo_uploaded',
    'color_selected', 'favorite_added', 'export_requested'
  )),
  event_data jsonb NOT NULL DEFAULT '{}',

  -- Context
  user_agent text,
  ip_address inet,
  page_url text,
  referrer text,

  -- Performance metrics
  response_time_ms integer CHECK (response_time_ms >= 0),
  error_message text,

  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies for multi-schema
ALTER TABLE sanzo_color_advisor.sanzo_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_color_advisor.sanzo_color_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_color_advisor.sanzo_room_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_color_advisor.sanzo_user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_color_advisor.sanzo_color_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE sanzo_color_advisor.sanzo_usage_analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON sanzo_color_advisor.sanzo_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON sanzo_color_advisor.sanzo_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON sanzo_color_advisor.sanzo_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Color analyses policies
CREATE POLICY "Users can view own analyses" ON sanzo_color_advisor.sanzo_color_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses" ON sanzo_color_advisor.sanzo_color_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON sanzo_color_advisor.sanzo_color_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON sanzo_color_advisor.sanzo_color_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- Room photos policies
CREATE POLICY "Users can view own photos" ON sanzo_color_advisor.sanzo_room_photos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own photos" ON sanzo_color_advisor.sanzo_room_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON sanzo_color_advisor.sanzo_room_photos
  FOR DELETE USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can manage own favorites" ON sanzo_color_advisor.sanzo_user_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Color trends policies (public read)
CREATE POLICY "Anyone can view color trends" ON sanzo_color_advisor.sanzo_color_trends
  FOR SELECT USING (true);

-- Usage analytics policies
CREATE POLICY "Users can view own analytics" ON sanzo_color_advisor.sanzo_usage_analytics
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can insert analytics" ON sanzo_color_advisor.sanzo_usage_analytics
  FOR INSERT WITH CHECK (true);

-- Indexes for performance (with schema prefix)
CREATE INDEX IF NOT EXISTS sanzo_profiles_email_idx ON sanzo_color_advisor.sanzo_profiles(email);
CREATE INDEX IF NOT EXISTS sanzo_color_analyses_user_id_idx ON sanzo_color_advisor.sanzo_color_analyses(user_id);
CREATE INDEX IF NOT EXISTS sanzo_color_analyses_analysis_type_idx ON sanzo_color_advisor.sanzo_color_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS sanzo_color_analyses_created_at_idx ON sanzo_color_advisor.sanzo_color_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS sanzo_room_photos_analysis_id_idx ON sanzo_color_advisor.sanzo_room_photos(analysis_id);
CREATE INDEX IF NOT EXISTS sanzo_room_photos_user_id_idx ON sanzo_color_advisor.sanzo_room_photos(user_id);
CREATE INDEX IF NOT EXISTS sanzo_room_photos_processing_status_idx ON sanzo_color_advisor.sanzo_room_photos(processing_status);
CREATE INDEX IF NOT EXISTS sanzo_user_favorites_user_id_idx ON sanzo_color_advisor.sanzo_user_favorites(user_id);
CREATE INDEX IF NOT EXISTS sanzo_color_trends_category_idx ON sanzo_color_advisor.sanzo_color_trends(category);
CREATE INDEX IF NOT EXISTS sanzo_usage_analytics_user_id_idx ON sanzo_color_advisor.sanzo_usage_analytics(user_id);
CREATE INDEX IF NOT EXISTS sanzo_usage_analytics_event_type_idx ON sanzo_color_advisor.sanzo_usage_analytics(event_type);
CREATE INDEX IF NOT EXISTS sanzo_usage_analytics_created_at_idx ON sanzo_color_advisor.sanzo_usage_analytics(created_at DESC);

-- Functions and Triggers (schema-aware)

-- Update updated_at timestamp function
CREATE OR REPLACE FUNCTION sanzo_color_advisor.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS sanzo_profiles_updated_at ON sanzo_color_advisor.sanzo_profiles;
CREATE TRIGGER sanzo_profiles_updated_at
  BEFORE UPDATE ON sanzo_color_advisor.sanzo_profiles
  FOR EACH ROW
  EXECUTE FUNCTION sanzo_color_advisor.handle_updated_at();

DROP TRIGGER IF EXISTS sanzo_color_trends_updated_at ON sanzo_color_advisor.sanzo_color_trends;
CREATE TRIGGER sanzo_color_trends_updated_at
  BEFORE UPDATE ON sanzo_color_advisor.sanzo_color_trends
  FOR EACH ROW
  EXECUTE FUNCTION sanzo_color_advisor.handle_updated_at();

-- Function to handle new user signup (schema-aware)
CREATE OR REPLACE FUNCTION sanzo_color_advisor.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO sanzo_color_advisor.sanzo_profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup (only create if not exists)
DROP TRIGGER IF EXISTS sanzo_on_auth_user_created ON auth.users;
CREATE TRIGGER sanzo_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sanzo_color_advisor.handle_new_user();

-- Insert sample Turkish color trends data
INSERT INTO sanzo_color_advisor.sanzo_color_trends (trend_name, colors, category, region, popularity_score, description) VALUES
('Turkish Traditional Colors 2025',
 '[
   {"hex": "#C41E3A", "name": "Ottoman Red", "description": "Classic Turkish red from Ottoman textiles"},
   {"hex": "#1C6BA0", "name": "Bosphorus Blue", "description": "Deep blue inspired by Istanbul waters"},
   {"hex": "#D4AF37", "name": "Byzantine Gold", "description": "Rich gold from Byzantine mosaics"},
   {"hex": "#8B4513", "name": "Cappadocia Earth", "description": "Natural brown from Cappadocia rock formations"}
 ]'::jsonb,
 'cultural', 'turkey', 0.85, 'Traditional Turkish colors with cultural significance for modern interiors'),

('Modern Minimalist 2025',
 '[
   {"hex": "#F5F5F5", "name": "Cloud White", "description": "Soft white for clean modern spaces"},
   {"hex": "#2F4F4F", "name": "Charcoal Grey", "description": "Sophisticated grey for accent walls"},
   {"hex": "#E6E6FA", "name": "Lavender Mist", "description": "Gentle purple for calming spaces"},
   {"hex": "#F0E68C", "name": "Warm Khaki", "description": "Natural beige for warmth"}
 ]'::jsonb,
 'interior', 'global', 0.78, 'Clean, minimal color palette for contemporary living spaces')
ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA sanzo_color_advisor TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA sanzo_color_advisor TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA sanzo_color_advisor TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA sanzo_color_advisor TO anon, authenticated;

-- Reset search path
RESET search_path;
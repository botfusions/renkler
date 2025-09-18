-- Supabase Database Schema for Sanzo Color Advisor
-- Created: 2025-09-18
-- Version: 1.0

-- Enable necessary extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Users table (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  language_preference text default 'tr' check (language_preference in ('tr', 'en')),
  theme_preference text default 'light' check (theme_preference in ('light', 'dark', 'auto')),
  accessibility_settings jsonb default '{}',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint profiles_email_check check (char_length(email) >= 3)
);

-- Color analyses table
create table public.color_analyses (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  analysis_type text not null check (analysis_type in ('room', 'personal', 'brand', 'harmony')),
  room_type text check (room_type in ('living_room', 'bedroom', 'kitchen', 'bathroom', 'office', 'dining_room', 'other')),

  -- Input data
  base_colors jsonb not null, -- Array of color objects {hex, name, source}
  lighting_conditions text default 'natural' check (lighting_conditions in ('natural', 'warm', 'cool', 'mixed')),
  room_size text check (room_size in ('small', 'medium', 'large')),
  style_preference text check (style_preference in ('modern', 'classic', 'minimalist', 'bohemian', 'traditional', 'eclectic')),

  -- AI generated results
  recommended_colors jsonb not null, -- Array of recommended colors with reasoning
  harmony_score numeric(3,2) check (harmony_score >= 0 and harmony_score <= 1),
  cultural_context jsonb, -- Turkish cultural color associations
  accessibility_notes jsonb, -- Color blindness considerations
  mood_analysis jsonb, -- Psychological color analysis

  -- Metadata
  analysis_duration_ms integer,
  confidence_score numeric(3,2) check (confidence_score >= 0 and confidence_score <= 1),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint color_analyses_base_colors_check check (jsonb_array_length(base_colors) > 0)
);

-- Room photos table
create table public.room_photos (
  id uuid default uuid_generate_v4() primary key,
  analysis_id uuid references public.color_analyses(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- File information
  file_name text not null,
  file_size integer not null check (file_size > 0),
  file_type text not null check (file_type in ('image/jpeg', 'image/png', 'image/webp')),
  storage_path text not null unique,

  -- Image analysis results
  extracted_colors jsonb not null, -- Colors detected from image
  dominant_colors jsonb not null, -- Top 5-10 dominant colors
  color_distribution jsonb, -- Percentage distribution of colors
  image_metadata jsonb, -- EXIF data, dimensions, etc.

  -- AI processing
  room_detection jsonb, -- Detected room elements (walls, furniture, etc.)
  lighting_analysis jsonb, -- Lighting conditions detected
  processing_status text default 'pending' check (processing_status in ('pending', 'processing', 'completed', 'failed')),
  processing_error text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  processed_at timestamp with time zone,

  constraint room_photos_extracted_colors_check check (jsonb_array_length(extracted_colors) > 0)
);

-- User favorite colors
create table public.user_favorites (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  color_hex text not null check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  color_name text not null,
  category text check (category in ('wall', 'accent', 'furniture', 'decor', 'personal')),
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,

  unique(user_id, color_hex)
);

-- Color trends tracking
create table public.color_trends (
  id uuid default uuid_generate_v4() primary key,
  trend_name text not null,
  colors jsonb not null, -- Array of trending colors
  category text not null check (category in ('seasonal', 'interior', 'fashion', 'brand', 'cultural')),
  region text default 'global' check (region in ('global', 'turkey', 'europe', 'asia')),

  -- Trend data
  popularity_score numeric(3,2) check (popularity_score >= 0 and popularity_score <= 1),
  trend_start_date date,
  trend_end_date date,
  description text,
  sources jsonb, -- Data sources and references

  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,

  constraint color_trends_dates_check check (trend_end_date is null or trend_end_date >= trend_start_date)
);

-- Analytics and usage tracking
create table public.usage_analytics (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  session_id text not null,

  -- Event data
  event_type text not null check (event_type in (
    'analysis_started', 'analysis_completed', 'photo_uploaded',
    'color_selected', 'favorite_added', 'export_requested'
  )),
  event_data jsonb not null default '{}',

  -- Context
  user_agent text,
  ip_address inet,
  page_url text,
  referrer text,

  -- Performance metrics
  response_time_ms integer check (response_time_ms >= 0),
  error_message text,

  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS) Policies
alter table public.profiles enable row level security;
alter table public.color_analyses enable row level security;
alter table public.room_photos enable row level security;
alter table public.user_favorites enable row level security;
alter table public.color_trends enable row level security;
alter table public.usage_analytics enable row level security;

-- Profiles policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- Color analyses policies
create policy "Users can view own analyses" on public.color_analyses
  for select using (auth.uid() = user_id);

create policy "Users can insert own analyses" on public.color_analyses
  for insert with check (auth.uid() = user_id);

create policy "Users can update own analyses" on public.color_analyses
  for update using (auth.uid() = user_id);

create policy "Users can delete own analyses" on public.color_analyses
  for delete using (auth.uid() = user_id);

-- Room photos policies
create policy "Users can view own photos" on public.room_photos
  for select using (auth.uid() = user_id);

create policy "Users can insert own photos" on public.room_photos
  for insert with check (auth.uid() = user_id);

create policy "Users can delete own photos" on public.room_photos
  for delete using (auth.uid() = user_id);

-- User favorites policies
create policy "Users can manage own favorites" on public.user_favorites
  for all using (auth.uid() = user_id);

-- Color trends policies (public read, admin write)
create policy "Anyone can view color trends" on public.color_trends
  for select using (true);

-- Usage analytics policies (users can view own data)
create policy "Users can view own analytics" on public.usage_analytics
  for select using (auth.uid() = user_id or user_id is null);

create policy "Anyone can insert analytics" on public.usage_analytics
  for insert with check (true);

-- Indexes for performance
create index profiles_email_idx on public.profiles(email);
create index color_analyses_user_id_idx on public.color_analyses(user_id);
create index color_analyses_analysis_type_idx on public.color_analyses(analysis_type);
create index color_analyses_created_at_idx on public.color_analyses(created_at desc);
create index room_photos_analysis_id_idx on public.room_photos(analysis_id);
create index room_photos_user_id_idx on public.room_photos(user_id);
create index room_photos_processing_status_idx on public.room_photos(processing_status);
create index user_favorites_user_id_idx on public.user_favorites(user_id);
create index color_trends_category_idx on public.color_trends(category);
create index usage_analytics_user_id_idx on public.usage_analytics(user_id);
create index usage_analytics_event_type_idx on public.usage_analytics(event_type);
create index usage_analytics_created_at_idx on public.usage_analytics(created_at desc);

-- Functions and Triggers

-- Update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create triggers
create trigger profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.handle_updated_at();

create trigger color_trends_updated_at
  before update on public.color_trends
  for each row
  execute function public.handle_updated_at();

-- Function to handle user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Insert sample color trends data
insert into public.color_trends (trend_name, colors, category, region, popularity_score, description) values
('Turkish Traditional Colors 2025',
 '[
   {"hex": "#C41E3A", "name": "Ottoman Red", "description": "Classic Turkish red from Ottoman textiles"},
   {"hex": "#1C6BA0", "name": "Bosphorus Blue", "description": "Deep blue inspired by Istanbul waters"},
   {"hex": "#D4AF37", "name": "Byzantine Gold", "description": "Rich gold from Byzantine mosaics"},
   {"hex": "#8B4513", "name": "Cappadocia Earth", "description": "Natural brown from Cappadocia rock formations"}
 ]',
 'cultural', 'turkey', 0.85, 'Traditional Turkish colors with cultural significance for modern interiors'),

('Modern Minimalist 2025',
 '[
   {"hex": "#F5F5F5", "name": "Cloud White", "description": "Soft white for clean modern spaces"},
   {"hex": "#2F4F4F", "name": "Charcoal Grey", "description": "Sophisticated grey for accent walls"},
   {"hex": "#E6E6FA", "name": "Lavender Mist", "description": "Gentle purple for calming spaces"},
   {"hex": "#F0E68C", "name": "Warm Khaki", "description": "Natural beige for warmth"}
 ]',
 'interior', 'global', 0.78, 'Clean, minimal color palette for contemporary living spaces');
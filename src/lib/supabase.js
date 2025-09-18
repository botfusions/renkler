/**
 * Supabase Client Configuration for Sanzo Color Advisor
 * Handles authentication, database operations, and file storage
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks for development
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'http://localhost:54321';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key-here';

// Multi-schema configuration for self-hosted Supabase
const supabaseSchema = process.env.SUPABASE_SCHEMA || 'sanzo_color_advisor';
const tablePrefix = process.env.SUPABASE_TABLE_PREFIX || 'sanzo_';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window?.localStorage || {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    }
  },
  db: {
    schema: supabaseSchema
  },
  global: {
    headers: {
      'X-Client-Info': 'sanzo-color-advisor@1.0.0'
    }
  }
});

// Helper function to get table name with prefix
function getTableName(baseName) {
  return `${tablePrefix}${baseName}`;
}

// Database helper functions
export const db = {
  // Profile operations
  profiles: {
    async get(userId) {
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    },

    async upsert(profile) {
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .upsert(profile, {
          onConflict: 'id',
          returning: 'representation'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async update(userId, updates) {
      const { data, error } = await supabase
        .from(getTableName('profiles'))
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  },

  // Color analysis operations
  colorAnalyses: {
    async create(analysis) {
      const { data, error } = await supabase
        .from(getTableName('color_analyses'))
        .insert(analysis)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getByUser(userId, limit = 20, offset = 0) {
      const { data, error } = await supabase
        .from(getTableName('color_analyses'))
        .select(`
          *,
          ${getTableName('room_photos')} (
            id,
            file_name,
            storage_path,
            extracted_colors,
            processing_status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;
      return data;
    },

    async getById(analysisId) {
      const { data, error } = await supabase
        .from(getTableName('color_analyses'))
        .select(`
          *,
          ${getTableName('room_photos')} (*)
        `)
        .eq('id', analysisId)
        .single();

      if (error) throw error;
      return data;
    },

    async update(analysisId, updates) {
      const { data, error } = await supabase
        .from(getTableName('color_analyses'))
        .update(updates)
        .eq('id', analysisId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async delete(analysisId) {
      const { error } = await supabase
        .from(getTableName('color_analyses'))
        .delete()
        .eq('id', analysisId);

      if (error) throw error;
    }
  },

  // Room photo operations
  roomPhotos: {
    async create(photo) {
      const { data, error } = await supabase
        .from('room_photos')
        .insert(photo)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async updateProcessingStatus(photoId, status, results = {}) {
      const updates = {
        processing_status: status,
        processed_at: new Date().toISOString()
      };

      if (status === 'completed') {
        Object.assign(updates, results);
      } else if (status === 'failed' && results.error) {
        updates.processing_error = results.error;
      }

      const { data, error } = await supabase
        .from('room_photos')
        .update(updates)
        .eq('id', photoId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async getByAnalysis(analysisId) {
      const { data, error } = await supabase
        .from('room_photos')
        .select('*')
        .eq('analysis_id', analysisId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  },

  // User favorites operations
  userFavorites: {
    async add(userId, color) {
      const { data, error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, ...color })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    async remove(userId, colorHex) {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('color_hex', colorHex);

      if (error) throw error;
    },

    async getByUser(userId) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },

    async isFavorite(userId, colorHex) {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('color_hex', colorHex)
        .single();

      return !error && data !== null;
    }
  },

  // Color trends operations
  colorTrends: {
    async getAll(category = null, region = 'global') {
      let query = supabase
        .from('color_trends')
        .select('*')
        .eq('region', region)
        .order('popularity_score', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },

    async getPopular(limit = 10) {
      const { data, error } = await supabase
        .from('color_trends')
        .select('*')
        .order('popularity_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    }
  },

  // Analytics operations
  analytics: {
    async track(event) {
      // Get current user session for user_id
      const { data: { user } } = await supabase.auth.getUser();

      const analyticsData = {
        user_id: user?.id || null,
        session_id: getSessionId(),
        ...event,
        user_agent: navigator?.userAgent || null,
        page_url: window?.location?.href || null,
        referrer: document?.referrer || null
      };

      const { error } = await supabase
        .from('usage_analytics')
        .insert(analyticsData);

      if (error) {
        console.warn('Analytics tracking failed:', error);
      }
    },

    async getUserStats(userId, days = 30) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from('usage_analytics')
        .select('event_type, created_at, event_data')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  }
};

// File storage operations
export const storage = {
  async uploadRoomPhoto(file, analysisId, userId) {
    const fileExt = file.name.split('.').pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `room-photos/${userId}/${analysisId}/${fileName}`;

    // Upload file to storage
    const { data, error } = await supabase.storage
      .from('room-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    return { path: data.path, fullPath: filePath };
  },

  async getPhotoUrl(path) {
    const { data } = supabase.storage
      .from('room-photos')
      .getPublicUrl(path);

    return data.publicUrl;
  },

  async deletePhoto(path) {
    const { error } = await supabase.storage
      .from('room-photos')
      .remove([path]);

    if (error) throw error;
  }
};

// Authentication helpers
export const auth = {
  async signUp(email, password, userData = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });

    if (error) throw error;
    return data;
  },

  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  },

  async signInWithProvider(provider) {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};

// Utility functions
function getSessionId() {
  let sessionId = sessionStorage.getItem('sanzo_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`;
    sessionStorage.setItem('sanzo_session_id', sessionId);
  }
  return sessionId;
}

// Real-time subscriptions
export const realtime = {
  subscribeToAnalyses(userId, callback) {
    return supabase
      .channel('color_analyses_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'color_analyses',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  },

  subscribeToPhotoProcessing(analysisId, callback) {
    return supabase
      .channel('photo_processing_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'room_photos',
          filter: `analysis_id=eq.${analysisId}`
        },
        callback
      )
      .subscribe();
  },

  unsubscribe(subscription) {
    return supabase.removeChannel(subscription);
  }
};

// Health check
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    return !error;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
}

export default supabase;
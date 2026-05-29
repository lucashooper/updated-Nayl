import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase config. Copy .env.example to .env and set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserSession {
  id: string;
  user_id: string;
  start_time: string;
  current_streak_seconds: number;
  total_streak_seconds: number;
  last_reset_time: string;
  created_at: string;
  updated_at: string;
}

export interface TriggerEntry {
  id: string;
  user_id: string;
  trigger: string;
  emoji: string;
  timestamp: string;
  details?: string;
  created_at: string;
}

export interface UserStats {
  id: string;
  user_id: string;
  total_episodes: number;
  longest_streak_seconds: number;
  current_streak_seconds: number;
  total_streak_seconds: number;
  cumulative_brain_rewiring_seconds: number;
  consecutive_days: number;
  last_login_date: string;
  total_days_logged_in: number;
  successful_days_this_week: number;
  profile_picture_url?: string;
  created_at: string;
  updated_at: string;
}

// Partial types for selective queries
export type UserStatsPartial = Partial<UserStats>;
export type UserSessionPartial = Partial<UserSession>;

// Dashboard and Analytics view types
export interface UserDashboard {
  user_id: string;
  current_streak_seconds: number;
  total_streak_seconds: number;
  start_time: string;
  last_reset_time: string;
  last_login_date: string;
  consecutive_days: number;
  longest_streak_seconds: number;
  total_episodes: number;
  total_days_logged_in: number;
  successful_days_this_week: number;
  total_achievements: number;
  unlocked_achievements: number;
}

export interface UserAnalytics {
  user_id: string;
  current_streak_seconds: number;
  total_streak_seconds: number;
  start_time: string;
  longest_streak_seconds: number;
  total_episodes: number;
  consecutive_days: number;
  total_days_logged_in: number;
  successful_days_this_week: number;
  total_triggers: number;
  days_with_triggers: number;
  avg_trigger_time: number;
}

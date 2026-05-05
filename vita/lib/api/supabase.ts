import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          age: number;
          weight_kg: number;
          height_cm: number;
          goal: string;
          activity_level: string;
          diet_quality: string;
          diet_restrictions: string[];
          tdee: number;
          protein_target: number;
          carb_target: number;
          fat_target: number;
          kcal_target: number;
          vita_score: number;
          streak_count: number;
          streak_last_date: string;
          total_xp: number;
          level: number;
          is_premium: boolean;
          premium_until: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      meal_logs: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          photo_url: string;
          foods_detected: { name: string; portion: string }[];
          calories: number;
          proteins_g: number;
          carbs_g: number;
          fats_g: number;
          meal_type: string;
        };
      };
      daily_logs: {
        Row: {
          user_id: string;
          date: string;
          water_glasses: number;
          water_goal_met: boolean;
          sleep_hours: number;
          sleep_quality: string;
          sport_completed: boolean;
          exercises_done: number;
          total_calories: number;
          total_proteins: number;
          xp_earned: number;
          tasks_completed: number;
        };
      };
    };
  };
};

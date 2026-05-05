import { supabase } from './supabase';
import type { UserProfile } from '../store/useUser';

export async function syncUserToSupabase(user: UserProfile): Promise<void> {
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      name: user.name,
      email: user.email,
      age: user.age,
      weight_kg: user.weight,
      height_cm: user.height,
      goal: user.goal,
      activity_level: user.activityLevel,
      diet_quality: user.dietQuality,
      diet_restrictions: user.dietRestrictions,
      tdee: user.tdee,
      protein_target: user.proteinTarget,
      carb_target: user.carbTarget,
      fat_target: user.fatTarget,
      kcal_target: user.kcalTarget,
      vita_score: user.vitaScore,
      streak_count: user.streakCount,
      streak_last_date: user.streakLastDate,
      total_xp: user.totalXp,
      level: user.level,
      is_premium: user.isPremium,
      premium_until: user.premiumUntil,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.warn('Supabase sync error:', error.message);
  }
}

export async function saveMealLog(params: {
  userId: string;
  photoUrl: string;
  foods: { name: string; portion: string }[];
  calories: number;
  proteinsG: number;
  carbsG: number;
  fatsG: number;
  mealType: string;
}): Promise<void> {
  await supabase.from('meal_logs').insert({
    user_id: params.userId,
    photo_url: params.photoUrl,
    foods_detected: params.foods,
    calories: params.calories,
    proteins_g: params.proteinsG,
    carbs_g: params.carbsG,
    fats_g: params.fatsG,
    meal_type: params.mealType,
    logged_at: new Date().toISOString(),
  });
}

export async function upsertDailyLog(params: {
  userId: string;
  date: string;
  waterGlasses: number;
  sleepHours: number;
  sleepQuality: string;
  sportCompleted: boolean;
  xpEarned: number;
  tasksCompleted: number;
}): Promise<void> {
  await supabase.from('daily_logs').upsert({
    user_id: params.userId,
    date: params.date,
    water_glasses: params.waterGlasses,
    water_goal_met: params.waterGlasses >= 8,
    sleep_hours: params.sleepHours,
    sleep_quality: params.sleepQuality,
    sport_completed: params.sportCompleted,
    xp_earned: params.xpEarned,
    tasks_completed: params.tasksCompleted,
  });
}

export const SUPABASE_SCHEMA_SQL = `
-- Exécuter dans le SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text,
  age integer,
  weight_kg integer,
  height_cm integer,
  goal text,
  activity_level text,
  diet_quality text,
  diet_restrictions text[],
  tdee integer DEFAULT 2000,
  protein_target integer DEFAULT 150,
  carb_target integer DEFAULT 200,
  fat_target integer DEFAULT 65,
  kcal_target integer DEFAULT 1800,
  vita_score integer DEFAULT 0,
  streak_count integer DEFAULT 0,
  streak_last_date date,
  total_xp integer DEFAULT 0,
  level integer DEFAULT 0,
  is_premium boolean DEFAULT false,
  premium_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  logged_at timestamptz DEFAULT now(),
  photo_url text,
  foods_detected jsonb,
  calories integer DEFAULT 0,
  proteins_g integer DEFAULT 0,
  carbs_g integer DEFAULT 0,
  fats_g integer DEFAULT 0,
  meal_type text DEFAULT 'snack'
);

CREATE TABLE IF NOT EXISTS daily_logs (
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL,
  water_glasses integer DEFAULT 0,
  water_goal_met boolean DEFAULT false,
  sleep_hours decimal DEFAULT 0,
  sleep_quality text,
  sport_completed boolean DEFAULT false,
  exercises_done integer DEFAULT 0,
  total_calories integer DEFAULT 0,
  total_proteins integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  tasks_completed integer DEFAULT 0,
  PRIMARY KEY (user_id, date)
);

CREATE TABLE IF NOT EXISTS user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  badge_id text NOT NULL,
  earned_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
`;

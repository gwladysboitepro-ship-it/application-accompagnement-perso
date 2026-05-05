import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  weight: number;
  height: number;
  goal: string;
  activityLevel: string;
  dietQuality: string;
  sleepDuration: string;
  dietRestrictions: string[];
  // Programme IA
  tdee: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
  kcalTarget: number;
  workoutsPerWeek: number;
  sleepTarget: number;
  vitaScore: number;
  // Gamification
  streakCount: number;
  streakLastDate: string;
  totalXp: number;
  level: number;
  // Premium
  isPremium: boolean;
  premiumUntil: string | null;
  // État
  onboardingComplete: boolean;
}

interface OnboardingData {
  goal?: string;
  name?: string;
  age?: number;
  weight?: number;
  height?: number;
  dietQuality?: string;
  activityLevel?: string;
  sleepDuration?: string;
  dietRestrictions?: string[];
}

interface UserStore {
  user: UserProfile | null;
  onboardingData: OnboardingData;
  setUser: (user: UserProfile) => void;
  updateUser: (patch: Partial<UserProfile>) => void;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  addXp: (amount: number) => void;
  checkAndUpdateStreak: () => boolean;
  logout: () => void;
}

const LEVELS = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
const LEVEL_TITLES = ['Débutant', 'Actif', 'Engagé', 'Guerrier', 'Champion', 'Athlète', 'Légende', 'Expert VITA'];

export function getLevelFromXp(xp: number): number {
  let level = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]) { level = i; break; }
  }
  return level;
}

export function getLevelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
}

export function getNextLevelXp(level: number): number {
  return LEVELS[Math.min(level + 1, LEVELS.length - 1)];
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      onboardingData: {},

      setUser: (user) => set({ user }),

      updateUser: (patch) => set((s) => ({
        user: s.user ? { ...s.user, ...patch } : null,
      })),

      setOnboardingData: (data) => set((s) => ({
        onboardingData: { ...s.onboardingData, ...data },
      })),

      addXp: (amount) => set((s) => {
        if (!s.user) return s;
        const newXp = s.user.totalXp + amount;
        const newLevel = getLevelFromXp(newXp);
        return { user: { ...s.user, totalXp: newXp, level: newLevel } };
      }),

      checkAndUpdateStreak: () => {
        const { user } = get();
        if (!user) return false;
        const today = new Date().toISOString().split('T')[0];
        const last = user.streakLastDate;
        if (last === today) return true;
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const isConsecutive = last === yesterday;
        const newStreak = isConsecutive ? user.streakCount + 1 : 1;
        set({ user: { ...user, streakCount: newStreak, streakLastDate: today } });
        return isConsecutive;
      },

      logout: () => set({ user: null, onboardingData: {} }),
    }),
    {
      name: 'vita-user',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

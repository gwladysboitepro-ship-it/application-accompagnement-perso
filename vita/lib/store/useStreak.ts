import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DailyLog {
  date: string;
  waterGlasses: number;
  waterGoalMet: boolean;
  sleepHours: number;
  sleepQuality: string;
  sportCompleted: boolean;
  exercisesDone: number;
  totalCalories: number;
  totalProteins: number;
  xpEarned: number;
  tasksCompleted: number;
  mealPhotosLogged: number;
  coachMessagesUsed: number;
}

interface StreakStore {
  today: DailyLog;
  photosTakenToday: number;
  coachMessagesUsed: number;
  getTodayLog: () => DailyLog;
  logWater: (glasses: number) => number;
  logSleep: (hours: number, quality: string) => void;
  logSport: (exercisesDone: number) => void;
  addMealPhoto: () => boolean;
  useCoachMessage: () => boolean;
  addXpToday: (xp: number) => void;
  incrementTasks: () => void;
  resetIfNewDay: () => void;
}

const todayDate = () => new Date().toISOString().split('T')[0];

const emptyDay = (): DailyLog => ({
  date: todayDate(),
  waterGlasses: 0,
  waterGoalMet: false,
  sleepHours: 0,
  sleepQuality: '',
  sportCompleted: false,
  exercisesDone: 0,
  totalCalories: 0,
  totalProteins: 0,
  xpEarned: 0,
  tasksCompleted: 0,
  mealPhotosLogged: 0,
  coachMessagesUsed: 0,
});

export const useStreakStore = create<StreakStore>()(
  persist(
    (set, get) => ({
      today: emptyDay(),
      photosTakenToday: 0,
      coachMessagesUsed: 0,

      getTodayLog: () => get().today,

      resetIfNewDay: () => {
        const { today } = get();
        if (today.date !== todayDate()) {
          set({ today: emptyDay(), photosTakenToday: 0, coachMessagesUsed: 0 });
        }
      },

      logWater: (glasses) => {
        set((s) => ({
          today: {
            ...s.today,
            waterGlasses: glasses,
            waterGoalMet: glasses >= 8,
          },
        }));
        return glasses >= 8 ? 20 : 0;
      },

      logSleep: (hours, quality) => {
        set((s) => ({ today: { ...s.today, sleepHours: hours, sleepQuality: quality } }));
      },

      logSport: (exercisesDone) => {
        set((s) => ({
          today: { ...s.today, sportCompleted: true, exercisesDone },
        }));
      },

      addMealPhoto: () => {
        const { photosTakenToday } = get();
        if (photosTakenToday >= 4) return false;
        set((s) => ({
          photosTakenToday: s.photosTakenToday + 1,
          today: { ...s.today, mealPhotosLogged: s.today.mealPhotosLogged + 1 },
        }));
        return true;
      },

      useCoachMessage: () => {
        const { coachMessagesUsed } = get();
        if (coachMessagesUsed >= 5) return false;
        set((s) => ({ coachMessagesUsed: s.coachMessagesUsed + 1 }));
        return true;
      },

      addXpToday: (xp) => {
        set((s) => ({ today: { ...s.today, xpEarned: s.today.xpEarned + xp } }));
      },

      incrementTasks: () => {
        set((s) => ({ today: { ...s.today, tasksCompleted: s.today.tasksCompleted + 1 } }));
      },
    }),
    {
      name: 'vita-streak',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export function calculateTDEE(params: {
  weight: number;
  height: number;
  age: number;
  activityLevel: string;
  gender?: 'male' | 'female';
}): number {
  const { weight, height, age, activityLevel, gender = 'male' } = params;
  const bmr = gender === 'male'
    ? 10 * weight + 6.25 * height - 5 * age + 5
    : 10 * weight + 6.25 * height - 5 * age - 161;

  const multipliers: Record<string, number> = {
    jamais: 1.2,
    '1-2x': 1.375,
    '3-4x': 1.55,
    'tous-les-jours': 1.725,
  };

  return Math.round(bmr * (multipliers[activityLevel] ?? 1.375));
}

export function calculateMacros(kcal: number): {
  proteins: number;
  carbs: number;
  fats: number;
} {
  return {
    proteins: Math.round((kcal * 0.3) / 4),
    carbs: Math.round((kcal * 0.45) / 4),
    fats: Math.round((kcal * 0.25) / 9),
  };
}

export function calculateVitaScore(daily: {
  calories: number;
  kcalTarget: number;
  sportCompleted: boolean;
  workoutsPerWeek: number;
  waterGlasses: number;
  sleepHours: number;
  streakCount: number;
}): number {
  const { calories, kcalTarget, sportCompleted, waterGlasses, sleepHours, streakCount } = daily;

  // Nutrition 35 pts
  const ratio = kcalTarget > 0 ? calories / kcalTarget : 0;
  const nutritionScore = ratio >= 0.9 && ratio <= 1.1 ? 35 : Math.max(0, 35 - Math.abs(1 - ratio) * 50);

  // Sport 25 pts
  const sportScore = sportCompleted ? 25 : 0;

  // Hydratation 15 pts
  const waterScore = Math.min(15, (waterGlasses / 8) * 15);

  // Sommeil 15 pts
  const sleepScore = sleepHours >= 7 && sleepHours <= 9 ? 15 : sleepHours >= 6 ? 10 : 5;

  // Régularité 10 pts
  const regularityScore = Math.min(10, (streakCount / 30) * 10);

  return Math.round(nutritionScore + sportScore + waterScore + sleepScore + regularityScore);
}

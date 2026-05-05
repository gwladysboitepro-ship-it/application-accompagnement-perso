import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from 'react-native-reanimated';
import { useStreakStore } from '../../lib/store/useStreak';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const EXERCISES_BY_GOAL: Record<string, { name: string; detail: string; icon: string }[]> = {
  poids: [
    { name: 'Squats', detail: '3 × 15 reps', icon: '🏋️' },
    { name: 'Pompes', detail: '3 × 12 reps', icon: '💪' },
    { name: 'Fentes', detail: '3 × 12 reps/jambe', icon: '🦵' },
    { name: 'Gainage', detail: '3 × 45 secondes', icon: '🧱' },
    { name: 'Burpees', detail: '3 × 10 reps', icon: '🔥' },
  ],
  muscle: [
    { name: 'Développé couché', detail: '4 × 8 reps', icon: '🏋️' },
    { name: 'Tractions', detail: '4 × 6 reps', icon: '💪' },
    { name: 'Squat barre', detail: '4 × 8 reps', icon: '🦵' },
    { name: 'Épaules haltères', detail: '3 × 12 reps', icon: '🎯' },
    { name: 'Curl biceps', detail: '3 × 12 reps', icon: '💪' },
  ],
  default: [
    { name: 'Marche rapide', detail: '20 minutes', icon: '🚶' },
    { name: 'Étirements', detail: '10 minutes', icon: '🧘' },
    { name: 'Pompes', detail: '3 × 10 reps', icon: '💪' },
    { name: 'Squats', detail: '3 × 12 reps', icon: '🏋️' },
    { name: 'Abdominaux', detail: '3 × 15 reps', icon: '🔥' },
  ],
};

function ExerciseItem({
  exercise, checked, onToggle,
}: { exercise: { name: string; detail: string; icon: string }; checked: boolean; onToggle: () => void }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(checked ? 1 : 1.05, { damping: 12 }, () => {
      scale.value = withSpring(1);
    });
    onToggle();
  };

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={style}>
      <TouchableOpacity
        style={[styles.exercise, checked && styles.exerciseChecked]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
        <View style={styles.exerciseInfo}>
          <Text style={[styles.exerciseName, checked && styles.exerciseNameChecked]}>
            {exercise.name}
          </Text>
          <Text style={styles.exerciseDetail}>{exercise.detail}</Text>
        </View>
        <View style={[styles.checkBox, checked && styles.checkBoxChecked]}>
          {checked && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface SportSessionProps {
  onComplete: (xp: number) => void;
  goal?: string;
}

export function SportSession({ onComplete, goal = 'default' }: SportSessionProps) {
  const exercises = EXERCISES_BY_GOAL[goal] ?? EXERCISES_BY_GOAL.default;
  const [checked, setChecked] = useState<boolean[]>(new Array(exercises.length).fill(false));
  const logSport = useStreakStore((s) => s.logSport);
  const addXpToday = useStreakStore((s) => s.addXpToday);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const doneCount = checked.filter(Boolean).length;
  const canFinish = doneCount >= Math.ceil(exercises.length * 0.5);

  const handleFinish = () => {
    logSport(doneCount);
    addXpToday(50);
    onComplete(50);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ta séance sport 💪</Text>
      <Text style={styles.subtitle}>
        Coche les exercices réalisés. {'\n'}
        Complète au moins {Math.ceil(exercises.length * 0.5)}/{exercises.length} pour valider.
      </Text>

      <View style={styles.progressRow}>
        <Text style={styles.progressText}>{doneCount} / {exercises.length} exercices</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(doneCount / exercises.length) * 100}%` }]} />
        </View>
      </View>

      <View style={styles.list}>
        {exercises.map((ex, i) => (
          <ExerciseItem key={i} exercise={ex} checked={checked[i]} onToggle={() => toggle(i)} />
        ))}
      </View>

      <Button
        label={canFinish ? `Terminer la séance 🏆 (+50 XP)` : `Encore ${Math.ceil(exercises.length * 0.5) - doneCount} exercice(s)...`}
        onPress={handleFinish}
        variant="green"
        disabled={!canFinish}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  title: { fontSize: 24, fontFamily: 'Fraunces-Black', color: Colors.textPrimary, textAlign: 'center' },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressRow: { gap: Spacing.xs },
  progressText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: Colors.green, borderRadius: 3 },
  list: { gap: Spacing.sm },
  exercise: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  exerciseChecked: {
    borderColor: Colors.green,
    backgroundColor: Colors.green + '10',
  },
  exerciseIcon: { fontSize: 24 },
  exerciseInfo: { flex: 1, gap: 2 },
  exerciseName: { fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textPrimary },
  exerciseNameChecked: { color: Colors.green },
  exerciseDetail: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.textSecondary },
  checkBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: { backgroundColor: Colors.green, borderColor: Colors.green },
  checkMark: { color: '#FFF', fontSize: 16, fontFamily: 'Nunito-ExtraBold' },
});

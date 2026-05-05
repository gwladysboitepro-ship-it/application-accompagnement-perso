import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { useStreakStore } from '../../lib/store/useStreak';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const TOTAL = 8;

function WaterGlass({ filled, onPress }: { filled: boolean; onPress: () => void }) {
  const fillHeight = useSharedValue(filled ? 1 : 0);

  React.useEffect(() => {
    fillHeight.value = withSpring(filled ? 1 : 0, { damping: 12, stiffness: 200 });
  }, [filled]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${fillHeight.value * 100}%`,
  }));

  return (
    <TouchableOpacity onPress={onPress} style={styles.glassOuter} activeOpacity={0.8}>
      <View style={styles.glass}>
        <Animated.View style={[styles.fill, fillStyle]} />
      </View>
      <Text style={styles.glassEmoji}>{filled ? '💧' : '○'}</Text>
    </TouchableOpacity>
  );
}

interface WaterTrackerProps {
  onComplete: (xp: number) => void;
}

export function WaterTracker({ onComplete }: WaterTrackerProps) {
  const today = useStreakStore((s) => s.today);
  const logWater = useStreakStore((s) => s.logWater);
  const addXpToday = useStreakStore((s) => s.addXpToday);
  const [glasses, setGlasses] = useState(today.waterGlasses);

  const toggle = (i: number) => {
    const newVal = glasses === i + 1 ? i : i + 1;
    setGlasses(newVal);
  };

  const handleValidate = () => {
    const xpEarned = logWater(glasses);
    if (xpEarned > 0) addXpToday(xpEarned);
    onComplete(xpEarned > 0 ? 20 : 5);
  };

  const getCoachMessage = () => {
    if (glasses >= 8) return '🎉 Parfait ! Tu atteins ton objectif hydratation !';
    if (glasses >= 6) return '💧 Très bien ! Encore 2 verres pour atteindre ton objectif.';
    if (glasses >= 4) return '👍 Bonne progression ! Tu es à mi-chemin.';
    return '⚠️ Essaie de boire plus ! L\'hydratation est essentielle à ta santé.';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Combien de verres{'\n'}d'eau as-tu bu ?</Text>

      <View style={styles.counter}>
        <Text style={styles.count}>{glasses}</Text>
        <Text style={styles.countLabel}>/ {TOTAL} verres</Text>
      </View>

      <View style={styles.glassGrid}>
        {Array.from({ length: TOTAL }, (_, i) => (
          <WaterGlass key={i} filled={i < glasses} onPress={() => toggle(i)} />
        ))}
      </View>

      {glasses > 0 && (
        <View style={styles.coachBox}>
          <Text style={styles.coachText}>{getCoachMessage()}</Text>
        </View>
      )}

      <Button
        label={glasses >= 8 ? 'Objectif atteint ! 💧' : 'Valider mon hydratation'}
        onPress={handleValidate}
        variant={glasses >= 8 ? 'blue' : 'blue'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  title: {
    fontSize: 24,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 32,
  },
  counter: { alignItems: 'center', gap: 4 },
  count: { fontSize: 56, fontFamily: 'Fraunces-Black', color: Colors.blue },
  countLabel: { fontSize: 16, fontFamily: 'Nunito-Bold', color: Colors.textSecondary },
  glassGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  glassOuter: { alignItems: 'center', gap: 4 },
  glass: {
    width: 36,
    height: 48,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.blue,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  fill: {
    width: '100%',
    backgroundColor: Colors.blue,
    opacity: 0.7,
  },
  glassEmoji: { fontSize: 14 },
  coachBox: {
    backgroundColor: Colors.blue + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.blue,
  },
  coachText: { color: Colors.blue, fontFamily: 'Nunito-Bold', fontSize: 14, lineHeight: 22 },
});

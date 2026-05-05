import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { useStreakStore } from '../../lib/store/useStreak';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const QUALITY_OPTIONS = [
  { value: 'tres-mal', emoji: '😫', label: 'Très mal' },
  { value: 'moyen', emoji: '😐', label: 'Moyen' },
  { value: 'bien', emoji: '😊', label: 'Bien' },
  { value: 'super', emoji: '🌟', label: 'Super' },
];

interface SleepLoggerProps {
  onComplete: (xp: number) => void;
}

export function SleepLogger({ onComplete }: SleepLoggerProps) {
  const [hours, setHours] = useState(7.5);
  const [quality, setQuality] = useState('');
  const logSleep = useStreakStore((s) => s.logSleep);
  const addXpToday = useStreakStore((s) => s.addXpToday);

  const formatHours = (h: number) => {
    const wholeHours = Math.floor(h);
    const mins = h % 1 === 0.5 ? '30' : '00';
    return `${wholeHours}h${mins}`;
  };

  const getCoachMessage = () => {
    if (hours < 6) return '⚠️ Moins de 6h de sommeil affecte ta récupération et tes performances. Essaie de dormir plus tôt ce soir !';
    if (hours < 7) return '💡 Tu es proche de l\'idéal ! 7-9h de sommeil est recommandé pour optimiser tes résultats.';
    if (hours <= 9) return '🌟 Excellent ! Tu dors dans la plage idéale de 7-9h. Ton corps récupère parfaitement.';
    return '😴 Tu dors beaucoup ! Assure-toi que ta qualité de sommeil est bonne.';
  };

  const increaseHours = () => setHours((h) => Math.min(12, h + 0.5));
  const decreaseHours = () => setHours((h) => Math.max(3, h - 0.5));

  const handleValidate = () => {
    if (!quality) return;
    logSleep(hours, quality);
    addXpToday(20);
    onComplete(20);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comment tu as{'\n'}dormi cette nuit ?</Text>

      <View style={styles.hoursDisplay}>
        <TouchableOpacity onPress={decreaseHours} style={styles.adjBtn}>
          <Text style={styles.adjBtnText}>−</Text>
        </TouchableOpacity>
        <Text style={styles.hoursText}>{formatHours(hours)}</Text>
        <TouchableOpacity onPress={increaseHours} style={styles.adjBtn}>
          <Text style={styles.adjBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.coachBox}>
        <Text style={styles.coachText}>{getCoachMessage()}</Text>
      </View>

      <Text style={styles.qualityLabel}>Qualité du sommeil</Text>
      <View style={styles.qualityGrid}>
        {QUALITY_OPTIONS.map((q) => (
          <TouchableOpacity
            key={q.value}
            style={[styles.qualityBtn, quality === q.value && styles.qualityBtnSelected]}
            onPress={() => setQuality(q.value)}
          >
            <Text style={styles.qualityEmoji}>{q.emoji}</Text>
            <Text style={[styles.qualityText, quality === q.value && styles.qualityTextSelected]}>
              {q.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        label="Enregistrer mon sommeil 😴"
        onPress={handleValidate}
        variant="purple"
        disabled={!quality}
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
  hoursDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  adjBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.purple + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjBtnText: { fontSize: 24, color: Colors.purple, fontFamily: 'Nunito-ExtraBold' },
  hoursText: {
    fontSize: 52,
    fontFamily: 'Fraunces-Black',
    color: Colors.purple,
    minWidth: 120,
    textAlign: 'center',
  },
  coachBox: {
    backgroundColor: Colors.purple + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.purple,
  },
  coachText: { color: Colors.purple, fontFamily: 'Nunito-Bold', fontSize: 14, lineHeight: 22 },
  qualityLabel: {
    fontSize: 15,
    fontFamily: 'Nunito-ExtraBold',
    color: Colors.textPrimary,
  },
  qualityGrid: { flexDirection: 'row', gap: Spacing.sm },
  qualityBtn: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  qualityBtnSelected: {
    borderColor: Colors.purple,
    backgroundColor: Colors.purple + '15',
  },
  qualityEmoji: { fontSize: 22 },
  qualityText: { fontSize: 11, fontFamily: 'Nunito-Bold', color: Colors.textSecondary, textAlign: 'center' },
  qualityTextSelected: { color: Colors.purple },
});

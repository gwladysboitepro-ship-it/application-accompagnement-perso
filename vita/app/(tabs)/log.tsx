import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useStreakStore } from '../../lib/store/useStreak';

export default function LogScreen() {
  const today = useStreakStore((s) => s.today);
  const photosToday = useStreakStore((s) => s.photosTakenToday);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📸 Logger un repas</Text>
        <Text style={styles.subtitle}>Analyse IA instantanée</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* CTA principal */}
        <View style={styles.cta}>
          <Text style={styles.ctaEmoji}>🍽️</Text>
          <Text style={styles.ctaTitle}>Prends ton repas en photo</Text>
          <Text style={styles.ctaSubtitle}>
            L'IA VITA analyse instantanément tes macros, calories et te donne des conseils personnalisés
          </Text>
          <Button
            label="📷 Analyser un repas (+30 XP)"
            onPress={() => router.push('/lesson/photo')}
            variant="orange"
          />
          <Text style={styles.limit}>{photosToday}/4 photos aujourd'hui</Text>
        </View>

        {/* Stats du jour */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aujourd'hui</Text>
          <View style={styles.dailyStats}>
            <StatRow
              emoji="🔥"
              label="Calories"
              value={today.totalCalories}
              unit="kcal"
              color={Colors.orange}
            />
            <StatRow
              emoji="💪"
              label="Protéines"
              value={today.totalProteins}
              unit="g"
              color={Colors.blue}
            />
            <StatRow
              emoji="📸"
              label="Repas loggés"
              value={photosToday}
              unit="repas"
              color={Colors.green}
            />
          </View>
        </View>

        {/* Types de repas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type de repas</Text>
          <View style={styles.mealTypes}>
            {[
              { type: 'breakfast', label: 'Petit-déjeuner', emoji: '☀️', time: '7h-10h' },
              { type: 'lunch', label: 'Déjeuner', emoji: '🌤️', time: '12h-14h' },
              { type: 'dinner', label: 'Dîner', emoji: '🌙', time: '19h-21h' },
              { type: 'snack', label: 'Snack', emoji: '🍎', time: 'Entre les repas' },
            ].map((meal) => (
              <TouchableOpacity
                key={meal.type}
                style={styles.mealCard}
                onPress={() => router.push('/lesson/photo')}
              >
                <Text style={styles.mealEmoji}>{meal.emoji}</Text>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealLabel}>{meal.label}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
                <Text style={styles.mealArrow}>+</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function StatRow({ emoji, label, value, unit, color }: {
  emoji: string; label: string; value: number; unit: string; color: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value} {unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 55,
    paddingBottom: Spacing.md,
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: { fontFamily: 'Fraunces-Black', fontSize: 24, color: Colors.textPrimary },
  subtitle: { fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.textSecondary },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 100 },
  cta: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.orange + '44',
  },
  ctaEmoji: { fontSize: 48 },
  ctaTitle: { fontFamily: 'Fraunces-Black', fontSize: 20, color: Colors.textPrimary, textAlign: 'center' },
  ctaSubtitle: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  limit: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.textMuted },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  dailyStats: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  statEmoji: { fontSize: 20 },
  statLabel: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textSecondary },
  statValue: { fontFamily: 'Nunito-ExtraBold', fontSize: 15 },
  mealTypes: { gap: Spacing.sm },
  mealCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  mealEmoji: { fontSize: 24 },
  mealInfo: { flex: 1, gap: 2 },
  mealLabel: { fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textPrimary },
  mealTime: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.textMuted },
  mealArrow: { fontSize: 20, color: Colors.green, fontFamily: 'Nunito-ExtraBold' },
});

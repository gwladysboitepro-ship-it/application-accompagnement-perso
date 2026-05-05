import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated as RNAnimated,
} from 'react-native';
import { router } from 'expo-router';
import { useUserStore } from '../../lib/store/useUser';
import { useStreakStore } from '../../lib/store/useStreak';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { LessonBubble } from '../../components/ui/LessonBubble';
import { StreakBadge } from '../../components/ui/StreakBadge';
import { Colors, Spacing, Radius } from '../../constants/theme';

const LESSONS = [
  { type: 'photo', icon: '📸', label: 'Photo repas', xp: 30, position: 'left' as const },
  { type: 'water', icon: '💧', label: 'Hydratation', xp: 20, position: 'center' as const },
  { type: 'sleep', icon: '😴', label: 'Sommeil', xp: 20, position: 'right' as const },
  { type: 'quiz', icon: '🧠', label: 'Quiz nutrition', xp: 40, position: 'center' as const },
  { type: 'sport', icon: '💪', label: 'Sport', xp: 50, position: 'left' as const },
];

function TreasureChest({ onPress }: { onPress: () => void }) {
  const scale = useRef(new RNAnimated.Value(1)).current;

  const animate = () => {
    RNAnimated.sequence([
      RNAnimated.timing(scale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      RNAnimated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={animate} activeOpacity={0.8} style={styles.treasureWrapper}>
      <RNAnimated.View style={[styles.treasure, { transform: [{ scale }] }]}>
        <Text style={styles.treasureEmoji}>🎁</Text>
        <Text style={styles.treasureXP}>+15 XP</Text>
      </RNAnimated.View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const user = useUserStore((s) => s.user);
  const addXp = useUserStore((s) => s.addXp);
  const today = useStreakStore((s) => s.today);
  const resetIfNewDay = useStreakStore((s) => s.resetIfNewDay);

  useEffect(() => {
    resetIfNewDay();
  }, []);

  const tasksTotal = LESSONS.length;
  const tasksDone = today.tasksCompleted;
  const xpToday = today.xpEarned;
  const xpGoal = 100;

  const getLessonState = (index: number): 'done' | 'active' | 'locked' => {
    if (index < tasksDone) return 'done';
    if (index === tasksDone) return 'active';
    return 'locked';
  };

  return (
    <View style={styles.container}>
      {/* Topbar */}
      <View style={styles.topbar}>
        <StreakBadge count={user?.streakCount ?? 0} />
        <View style={styles.xpPill}>
          <Text style={styles.xpPillIcon}>⚡</Text>
          <Text style={styles.xpPillText}>{user?.totalXp ?? 0} XP</Text>
        </View>
        <View style={styles.heartsPill}>
          <Text style={styles.heartsIcon}>❤️</Text>
          <Text style={styles.heartsText}>5</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{(user?.name ?? 'U')[0].toUpperCase()}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Mission du jour */}
        <View style={styles.missionBanner}>
          <View style={styles.missionHeader}>
            <Text style={styles.missionTitle}>🎯 Mission du jour</Text>
            <Text style={styles.missionCount}>{tasksDone}/{tasksTotal} tâches</Text>
          </View>
          <ProgressBar progress={tasksDone / tasksTotal} />
          <Text style={styles.missionXp}>⚡ {xpGoal - xpToday > 0 ? xpGoal - xpToday : 0} XP restants</Text>
        </View>

        {/* Stats rapides */}
        <View style={styles.statsRow}>
          <StatPill
            emoji="🔥" label="Calories"
            value={`${today.totalCalories}`}
            target={`/${user?.kcalTarget ?? 2000}`}
            progress={user?.kcalTarget ? today.totalCalories / user.kcalTarget : 0}
            color={Colors.orange}
          />
          <StatPill
            emoji="💧" label="Eau"
            value={`${today.waterGlasses}`}
            target="/8"
            progress={today.waterGlasses / 8}
            color={Colors.blue}
          />
          <StatPill
            emoji="😴" label="Sommeil"
            value={today.sleepHours > 0 ? `${today.sleepHours}h` : '--'}
            target={`/${user?.sleepTarget ?? 8}h`}
            progress={today.sleepHours > 0 ? today.sleepHours / (user?.sleepTarget ?? 8) : 0}
            color={Colors.purple}
          />
        </View>

        {/* Parcours Duolingo */}
        <View style={styles.pathSection}>
          <Text style={styles.pathTitle}>🌿 Ton parcours</Text>
          <View style={styles.path}>
            {LESSONS.map((lesson, i) => {
              const state = getLessonState(i);
              // Insert treasure chest in the middle
              const showTreasure = i === 2;
              return (
                <View key={lesson.type}>
                  {showTreasure && (
                    <TreasureChest onPress={() => addXp(15)} />
                  )}
                  <LessonBubble
                    icon={lesson.icon}
                    state={state}
                    xp={lesson.xp}
                    position={lesson.position}
                    onPress={() => router.push(`/lesson/${lesson.type}`)}
                  />
                  {state !== 'locked' && (
                    <Text style={[styles.lessonLabel, { marginLeft: lesson.position === 'left' ? 0 : lesson.position === 'right' ? 80 : 40 }]}>
                      {lesson.label}
                    </Text>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* À faire maintenant */}
        <View style={styles.todoSection}>
          <Text style={styles.sectionTitle}>📋 À faire maintenant</Text>
          {LESSONS.filter((_, i) => getLessonState(i) !== 'done').slice(0, 3).map((lesson) => (
            <TouchableOpacity
              key={lesson.type}
              style={styles.todoItem}
              onPress={() => router.push(`/lesson/${lesson.type}`)}
            >
              <Text style={styles.todoEmoji}>{lesson.icon}</Text>
              <View style={styles.todoInfo}>
                <Text style={styles.todoLabel}>{lesson.label}</Text>
                <Text style={styles.todoXp}>+{lesson.xp} XP</Text>
              </View>
              <Text style={styles.todoArrow}>→</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function StatPill({ emoji, label, value, target, progress, color }: {
  emoji: string; label: string; value: string; target: string;
  progress: number; color: string;
}) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statPillEmoji}>{emoji}</Text>
      <Text style={[styles.statPillValue, { color }]}>{value}<Text style={styles.statPillTarget}>{target}</Text></Text>
      <Text style={styles.statPillLabel}>{label}</Text>
      <ProgressBar progress={progress} color={color} height={4} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  topbar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 55,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  xpPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A2A10',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  xpPillIcon: { fontSize: 14 },
  xpPillText: { color: Colors.green, fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  heartsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A1010',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  heartsIcon: { fontSize: 14 },
  heartsText: { color: Colors.red, fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  avatar: {
    marginLeft: 'auto',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#131F24', fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 100, gap: Spacing.lg },
  missionBanner: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  missionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  missionCount: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  missionXp: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.gold, textAlign: 'right' },
  statsRow: { flexDirection: 'row', gap: Spacing.sm },
  statPill: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statPillEmoji: { fontSize: 18 },
  statPillValue: { fontFamily: 'Fraunces-Black', fontSize: 18 },
  statPillTarget: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.textMuted },
  statPillLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: Colors.textSecondary },
  pathSection: { gap: Spacing.md },
  pathTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  path: { gap: 4 },
  lessonLabel: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    width: 64,
    marginTop: -4,
  },
  treasureWrapper: { alignItems: 'center', marginLeft: 'auto', marginRight: 'auto', marginVertical: Spacing.md },
  treasure: {
    backgroundColor: Colors.gold + '22',
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.gold,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  treasureEmoji: { fontSize: 32 },
  treasureXP: { fontFamily: 'Nunito-ExtraBold', fontSize: 13, color: Colors.gold },
  todoSection: { gap: Spacing.sm },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todoEmoji: { fontSize: 24 },
  todoInfo: { flex: 1, gap: 2 },
  todoLabel: { fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textPrimary },
  todoXp: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.gold },
  todoArrow: { fontSize: 18, color: Colors.textMuted },
});

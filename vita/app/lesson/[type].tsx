import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useUserStore } from '../../lib/store/useUser';
import { useStreakStore } from '../../lib/store/useStreak';
import { PhotoChallenge } from '../../components/lessons/PhotoChallenge';
import { WaterTracker } from '../../components/lessons/WaterTracker';
import { SleepLogger } from '../../components/lessons/SleepLogger';
import { QuizChallenge } from '../../components/lessons/QuizChallenge';
import { SportSession } from '../../components/lessons/SportSession';
import { Colors, Spacing, Radius } from '../../constants/theme';

const LESSON_CONFIG: Record<string, { title: string; subtitle: string; color: string }> = {
  photo: { title: 'Photo repas', subtitle: 'Analyse nutritionnelle IA', color: Colors.orange },
  water: { title: 'Hydratation', subtitle: 'Objectif 8 verres / jour', color: Colors.blue },
  sleep: { title: 'Sommeil', subtitle: 'Suivi de ta nuit', color: Colors.purple },
  quiz: { title: 'Quiz nutrition', subtitle: 'Apprends en t\'amusant', color: Colors.gold },
  sport: { title: 'Sport', subtitle: 'Ta séance d\'aujourd\'hui', color: Colors.green },
};

export default function LessonScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const user = useUserStore((s) => s.user);
  const addXp = useUserStore((s) => s.addXp);
  const incrementTasks = useStreakStore((s) => s.incrementTasks);

  const config = LESSON_CONFIG[type ?? 'photo'] ?? LESSON_CONFIG.photo;

  const handleComplete = (xp: number) => {
    if (xp > 0) {
      addXp(xp);
      incrementTasks();
    }
    router.replace('/celebration');
  };

  const renderLesson = () => {
    switch (type) {
      case 'photo': return <PhotoChallenge onComplete={handleComplete} />;
      case 'water': return <WaterTracker onComplete={handleComplete} />;
      case 'sleep': return <SleepLogger onComplete={handleComplete} />;
      case 'quiz': return <QuizChallenge onComplete={handleComplete} />;
      case 'sport': return <SportSession onComplete={handleComplete} goal={user?.goal} />;
      default: return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{config.title}</Text>
          <Text style={styles.headerSub}>{config.subtitle}</Text>
        </View>
        <View style={[styles.colorDot, { backgroundColor: config.color }]} />
      </View>

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { backgroundColor: config.color, width: '100%' }]} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderLesson()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 55,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 14, color: Colors.textSecondary, fontFamily: 'Nunito-ExtraBold' },
  headerCenter: { flex: 1, gap: 2 },
  headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: Colors.textPrimary },
  headerSub: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.textSecondary },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  progressTrack: { height: 3, backgroundColor: Colors.border },
  progressFill: { height: '100%' },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 48 },
});

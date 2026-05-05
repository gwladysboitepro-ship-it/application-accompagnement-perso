import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedProps, useAnimatedStyle,
  withTiming, withSpring, Easing,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useUserStore } from '../../lib/store/useUser';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const RADIUS = 80;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function VitaRing({ score }: { score: number }) {
  const progress = useSharedValue(0);
  const displayScore = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 1500,
      easing: Easing.bezier(0.34, 1.2, 0.64, 1),
    });
    displayScore.value = withTiming(score, { duration: 1500 });
  }, [score]);

  const animProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    opacity: progress.value > 0 ? 1 : 0,
  }));

  return (
    <View style={styles.ringContainer}>
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <Circle
          cx="100" cy="100" r={RADIUS}
          stroke={Colors.border} strokeWidth={14}
          fill="transparent"
        />
        <AnimatedCircle
          cx="100" cy="100" r={RADIUS}
          stroke={Colors.green} strokeWidth={14}
          fill="transparent"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animProps}
          strokeLinecap="round"
          rotation="-90"
          origin="100, 100"
        />
      </Svg>
      <Animated.View style={[styles.scoreCenter, scoreStyle]}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreLabel}>/ 100</Text>
        <Text style={styles.scoreTitle}>Score VITA</Text>
      </Animated.View>
    </View>
  );
}

export default function ResultScreen() {
  const user = useUserStore((s) => s.user);
  const score = user?.vitaScore ?? 65;

  const contentOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.9);

  useEffect(() => {
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentScale.value = withSpring(1, { damping: 15 });
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ scale: contentScale.value }],
  }));

  const getScoreMessage = () => {
    if (score >= 80) return '🌟 Excellent point de départ !';
    if (score >= 60) return '💪 Bonne base, on va progresser !';
    if (score >= 40) return '🚀 Du potentiel à développer !';
    return '🌱 Chaque voyage commence par un premier pas !';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.hello}>Voici ton programme,</Text>
      <Text style={styles.name}>{user?.name ?? 'Champion'} 🌿</Text>

      <VitaRing score={score} />

      <Text style={styles.message}>{getScoreMessage()}</Text>

      <Animated.View style={[styles.stats, contentStyle]}>
        <View style={styles.statRow}>
          <StatCard emoji="🔥" label="Calories/jour" value={`${user?.kcalTarget ?? 2000} kcal`} />
          <StatCard emoji="💪" label="Protéines" value={`${user?.proteinTarget ?? 150}g`} />
        </View>
        <View style={styles.statRow}>
          <StatCard emoji="🏋️" label="Sport/semaine" value={`${user?.workoutsPerWeek ?? 3}x`} />
          <StatCard emoji="😴" label="Sommeil cible" value={`${user?.sleepTarget ?? 8}h`} />
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Button
          label="Commencer mon programme 🚀"
          onPress={() => router.replace('/(tabs)/')}
          variant="green"
        />
        <Button
          label="Voir Premium — 7 jours gratuits"
          onPress={() => router.replace('/(tabs)/')}
          variant="ghost"
        />
      </View>
    </ScrollView>
  );
}

function StatCard({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  hello: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
  },
  name: {
    fontSize: 32,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
  },
  ringContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.lg,
  },
  scoreCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 52,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    lineHeight: 58,
  },
  scoreLabel: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
  },
  scoreTitle: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.green,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  message: {
    fontSize: 18,
    fontFamily: 'Nunito-Bold',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stats: { width: '100%', gap: Spacing.sm },
  statRow: { flexDirection: 'row', gap: Spacing.sm },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statEmoji: { fontSize: 24 },
  statValue: {
    fontSize: 20,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footer: { width: '100%', gap: Spacing.sm, marginTop: Spacing.md },
});

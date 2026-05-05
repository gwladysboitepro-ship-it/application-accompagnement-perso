import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withDelay, withSequence,
} from 'react-native-reanimated';
import { Confetti } from '../components/ui/Confetti';
import { Button } from '../components/ui/Button';
import { Colors, Spacing } from '../constants/theme';
import { useUserStore } from '../lib/store/useUser';

export default function CelebrationScreen() {
  const user = useUserStore((s) => s.user);
  const iconScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);

  useEffect(() => {
    iconScale.value = withSpring(1, { damping: 8, stiffness: 150 });
    titleOpacity.value = withDelay(300, withSpring(1));
    badgeScale.value = withDelay(500, withSequence(
      withSpring(1.2, { damping: 8 }),
      withSpring(1, { damping: 12 })
    ));
  }, []);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Confetti />

      <View style={styles.content}>
        <Animated.Text style={[styles.icon, iconStyle]}>🏆</Animated.Text>

        <Animated.View style={[styles.textBlock, titleStyle]}>
          <Text style={styles.title}>Incroyable !</Text>
          <Text style={styles.subtitle}>
            Tu viens de terminer ta leçon, {user?.name ?? 'champion'} !{'\n'}
            Continue comme ça, tu es sur la bonne voie 🌿
          </Text>
        </Animated.View>

        <Animated.View style={[styles.xpBadge, badgeStyle]}>
          <Text style={styles.xpIcon}>⚡</Text>
          <Text style={styles.xpText}>XP gagné</Text>
          <Text style={styles.xpAmount}>+{30}</Text>
        </Animated.View>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {user?.streakCount ?? 0}j</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⚡ {user?.totalXp ?? 0}</Text>
            <Text style={styles.statLabel}>XP total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>📊 {user?.vitaScore ?? 0}</Text>
            <Text style={styles.statLabel}>Score VITA</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Continuer →"
          onPress={() => router.replace('/(tabs)/')}
          variant="green"
        />
        <Button
          label="Demander conseil à mon coach"
          onPress={() => router.replace('/(tabs)/coach')}
          variant="ghost"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  textBlock: { alignItems: 'center', gap: Spacing.sm },
  title: {
    fontSize: 40,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  xpBadge: {
    backgroundColor: Colors.gold + '22',
    borderRadius: 20,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gold,
    gap: 4,
  },
  xpIcon: { fontSize: 28 },
  xpText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.textSecondary },
  xpAmount: { fontFamily: 'Fraunces-Black', fontSize: 36, color: Colors.gold },
  stats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: Spacing.lg,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  statValue: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  statLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: Colors.textSecondary },
  statDivider: { width: 1, height: 40, backgroundColor: Colors.border },
  footer: { gap: Spacing.sm },
});

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing } from '../../constants/theme';

export default function SplashScreen() {
  const logoScale = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const subtitleOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    titleOpacity.value = withDelay(300, withSpring(1));
    subtitleOpacity.value = withDelay(600, withSpring(1));
    buttonOpacity.value = withDelay(900, withSpring(1));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const titleStyle = useAnimatedStyle(() => ({ opacity: titleOpacity.value }));
  const subtitleStyle = useAnimatedStyle(() => ({ opacity: subtitleOpacity.value }));
  const buttonStyle = useAnimatedStyle(() => ({ opacity: buttonOpacity.value }));

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Animated.Text style={[styles.logo, logoStyle]}>🌿</Animated.Text>
        <Animated.Text style={[styles.title, titleStyle]}>VITA</Animated.Text>
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Ton coach santé IA{'\n'}personnalisé
        </Animated.Text>
      </View>

      <Animated.View style={[styles.footer, buttonStyle]}>
        <Button
          label="Commencer mon parcours"
          onPress={() => router.push('/(auth)/onboarding')}
          variant="green"
        />
        <Text style={styles.hint}>Gratuit · Sans carte bancaire</Text>
      </Animated.View>
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
    gap: Spacing.lg,
  },
  logo: {
    fontSize: 80,
  },
  title: {
    fontSize: 64,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
  },
  footer: {
    gap: Spacing.md,
  },
  hint: {
    color: Colors.textMuted,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    textAlign: 'center',
  },
});

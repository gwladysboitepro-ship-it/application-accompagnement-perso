import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withRepeat, withTiming,
  withDelay, withSpring, Easing,
} from 'react-native-reanimated';
import { Colors, Spacing } from '../../constants/theme';
import { generateProgram } from '../../lib/api/claude';
import { useUserStore } from '../../lib/store/useUser';

const STEPS = [
  'Calcul de votre métabolisme de base...',
  'Analyse de vos habitudes alimentaires...',
  'Personnalisation de votre programme sport...',
  'Optimisation de votre plan sommeil...',
  'Génération de votre Score VITA...',
];

export default function AnalysisScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const rotation = useSharedValue(0);
  const { onboardingData, setUser } = useUserStore();

  const stepOpacities = STEPS.map((_, i) => useSharedValue(i === 0 ? 1 : 0));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000, easing: Easing.linear }),
      -1,
      false
    );

    // Activer les étapes en séquence
    STEPS.forEach((_, i) => {
      if (i === 0) return;
      stepOpacities[i].value = withDelay(i * 800, withSpring(1));
    });

    // Timer pour avancer l'étape active
    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (idx < STEPS.length) setCurrentStep(idx);
      else clearInterval(interval);
    }, 800);

    // Lancer l'appel API
    runAnalysis();

    return () => clearInterval(interval);
  }, []);

  const runAnalysis = async () => {
    await new Promise((r) => setTimeout(r, 4000));

    try {
      const program = await generateProgram({
        name: onboardingData.name ?? 'Utilisateur',
        age: onboardingData.age ?? 25,
        weight: onboardingData.weight ?? 70,
        height: onboardingData.height ?? 170,
        goal: onboardingData.goal ?? 'energie',
        activityLevel: onboardingData.activityLevel ?? '1-2x',
        dietQuality: onboardingData.dietQuality ?? 'moyen',
        sleepDuration: onboardingData.sleepDuration ?? '7-8h',
        dietRestrictions: onboardingData.dietRestrictions ?? ['omnivore'],
      });

      setUser({
        id: Math.random().toString(36).slice(2),
        name: onboardingData.name ?? 'Utilisateur',
        email: '',
        age: onboardingData.age ?? 25,
        weight: onboardingData.weight ?? 70,
        height: onboardingData.height ?? 170,
        goal: onboardingData.goal ?? 'energie',
        activityLevel: onboardingData.activityLevel ?? '1-2x',
        dietQuality: onboardingData.dietQuality ?? 'moyen',
        sleepDuration: onboardingData.sleepDuration ?? '7-8h',
        dietRestrictions: onboardingData.dietRestrictions ?? ['omnivore'],
        tdee: program.tdee,
        proteinTarget: program.proteinesG,
        carbTarget: program.glucidesG,
        fatTarget: program.lipidesG,
        kcalTarget: program.objectifKcal,
        workoutsPerWeek: program.workoutsPerWeek,
        sleepTarget: program.sleepTarget,
        vitaScore: program.vitaScore,
        streakCount: 0,
        streakLastDate: '',
        totalXp: 0,
        level: 0,
        isPremium: false,
        premiumUntil: null,
        onboardingComplete: true,
      });

      router.replace('/(auth)/result');
    } catch (e) {
      router.replace('/(auth)/result');
    }
  };

  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.spinner, spinStyle]}>🌿</Animated.Text>
      <Text style={styles.title}>Création de ton{'\n'}programme VITA...</Text>

      <View style={styles.steps}>
        {STEPS.map((step, i) => {
          const opacityStyle = useAnimatedStyle(() => ({
            opacity: stepOpacities[i].value,
          }));
          return (
            <Animated.View key={i} style={[styles.stepRow, opacityStyle]}>
              <Text style={[styles.stepIcon, i <= currentStep && styles.stepIconActive]}>
                {i < currentStep ? '✅' : i === currentStep ? '⏳' : '○'}
              </Text>
              <Text style={[styles.stepText, i <= currentStep && styles.stepTextActive]}>
                {step}
              </Text>
            </Animated.View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xxl,
  },
  spinner: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 36,
  },
  steps: {
    width: '100%',
    gap: Spacing.md,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  stepIcon: {
    fontSize: 18,
    width: 24,
    textAlign: 'center',
    color: Colors.textMuted,
  },
  stepIconActive: {
    color: Colors.green,
  },
  stepText: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Nunito-Bold',
    color: Colors.textMuted,
  },
  stepTextActive: {
    color: Colors.textPrimary,
  },
});

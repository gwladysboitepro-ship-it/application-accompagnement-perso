import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSpring, runOnJS,
} from 'react-native-reanimated';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useUserStore } from '../../lib/store/useUser';

const TOTAL_STEPS = 6;

interface OptionCardProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

function OptionCard({ label, emoji, selected, onPress }: OptionCardProps) {
  return (
    <TouchableOpacity
      style={[styles.optionCard, selected && styles.optionCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {emoji && <Text style={styles.optionEmoji}>{emoji}</Text>}
      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{label}</Text>
      {selected && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );
}

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [dietQuality, setDietQuality] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [sleepDuration, setSleepDuration] = useState('');
  const [dietRestrictions, setDietRestrictions] = useState<string[]>([]);

  const slideX = useSharedValue(0);
  const setOnboardingData = useUserStore((s) => s.setOnboardingData);

  const slideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideX.value }],
  }));

  const goNext = () => {
    slideX.value = withTiming(-30, { duration: 150 }, () => {
      runOnJS(advanceStep)();
    });
  };

  const advanceStep = () => {
    slideX.value = 30;
    setStep((s) => s + 1);
    slideX.value = withSpring(0, { damping: 20 });
  };

  const handleNext = () => {
    if (step === TOTAL_STEPS) {
      // Save all data and go to analysis
      setOnboardingData({
        goal,
        name,
        age: parseInt(age),
        weight: parseFloat(weight),
        height: parseFloat(height),
        dietQuality,
        activityLevel,
        sleepDuration,
        dietRestrictions,
      });
      router.push('/(auth)/analysis');
      return;
    }
    goNext();
  };

  const toggleRestriction = (value: string) => {
    setDietRestrictions((prev) =>
      prev.includes(value) ? prev.filter((r) => r !== value) : [...prev, value]
    );
  };

  const canContinue = () => {
    switch (step) {
      case 1: return goal !== '';
      case 2: return name !== '' && age !== '' && weight !== '' && height !== '';
      case 3: return dietQuality !== '';
      case 4: return activityLevel !== '';
      case 5: return sleepDuration !== '';
      case 6: return dietRestrictions.length > 0;
      default: return false;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar progress={step / TOTAL_STEPS} />
        <Text style={styles.stepText}>{step} / {TOTAL_STEPS}</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.stepContent, slideStyle]}>
          {/* Step 1 : Objectif */}
          {step === 1 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>🎯</Text>
              <Text style={styles.title}>Quel est ton{'\n'}objectif principal ?</Text>
              <View style={styles.options}>
                {[
                  { value: 'poids', label: 'Perdre du poids', emoji: '⚖️' },
                  { value: 'muscle', label: 'Prendre du muscle', emoji: '💪' },
                  { value: 'energie', label: 'Avoir plus d\'énergie', emoji: '⚡' },
                  { value: 'sommeil', label: 'Mieux dormir', emoji: '🌙' },
                ].map((o) => (
                  <OptionCard key={o.value} label={o.label} emoji={o.emoji}
                    selected={goal === o.value} onPress={() => setGoal(o.value)} />
                ))}
              </View>
            </View>
          )}

          {/* Step 2 : Profil physique */}
          {step === 2 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>👤</Text>
              <Text style={styles.title}>Ton profil</Text>
              <View style={styles.inputs}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Prénom</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Alex"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.inputRow}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Âge</Text>
                    <TextInput
                      style={styles.input}
                      value={age}
                      onChangeText={setAge}
                      placeholder="28"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Poids (kg)</Text>
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      placeholder="72"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="decimal-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Taille (cm)</Text>
                    <TextInput
                      style={styles.input}
                      value={height}
                      onChangeText={setHeight}
                      placeholder="175"
                      placeholderTextColor={Colors.textMuted}
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Step 3 : Alimentation */}
          {step === 3 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>🥗</Text>
              <Text style={styles.title}>Comment tu manges{'\n'}en ce moment ?</Text>
              <View style={styles.options}>
                {[
                  { value: 'pas-top', label: 'Pas top', emoji: '😬' },
                  { value: 'moyen', label: 'Moyen', emoji: '😐' },
                  { value: 'bien', label: 'Bien', emoji: '😊' },
                  { value: 'tres-bien', label: 'Très bien', emoji: '🌟' },
                ].map((o) => (
                  <OptionCard key={o.value} label={o.label} emoji={o.emoji}
                    selected={dietQuality === o.value} onPress={() => setDietQuality(o.value)} />
                ))}
              </View>
            </View>
          )}

          {/* Step 4 : Activité */}
          {step === 4 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>🏃</Text>
              <Text style={styles.title}>Tu fais du sport{'\n'}combien de fois par semaine ?</Text>
              <View style={styles.options}>
                {[
                  { value: 'jamais', label: 'Jamais', emoji: '🛋️' },
                  { value: '1-2x', label: '1-2 fois', emoji: '🚶' },
                  { value: '3-4x', label: '3-4 fois', emoji: '🏋️' },
                  { value: 'tous-les-jours', label: 'Tous les jours', emoji: '🔥' },
                ].map((o) => (
                  <OptionCard key={o.value} label={o.label} emoji={o.emoji}
                    selected={activityLevel === o.value} onPress={() => setActivityLevel(o.value)} />
                ))}
              </View>
            </View>
          )}

          {/* Step 5 : Sommeil */}
          {step === 5 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>😴</Text>
              <Text style={styles.title}>Combien d'heures{'\n'}tu dors en moyenne ?</Text>
              <View style={styles.options}>
                {[
                  { value: 'moins-6h', label: 'Moins de 6h', emoji: '😵' },
                  { value: '6-7h', label: '6-7 heures', emoji: '😪' },
                  { value: '7-8h', label: '7-8 heures', emoji: '😊' },
                  { value: '8h-plus', label: '8h et plus', emoji: '😴' },
                ].map((o) => (
                  <OptionCard key={o.value} label={o.label} emoji={o.emoji}
                    selected={sleepDuration === o.value} onPress={() => setSleepDuration(o.value)} />
                ))}
              </View>
            </View>
          )}

          {/* Step 6 : Restrictions */}
          {step === 6 && (
            <View style={styles.step}>
              <Text style={styles.emoji}>🍽️</Text>
              <Text style={styles.title}>Ton régime{'\n'}alimentaire ?</Text>
              <Text style={styles.subtitle}>Tu peux sélectionner plusieurs options</Text>
              <View style={styles.options}>
                {[
                  { value: 'omnivore', label: 'Omnivore', emoji: '🥩' },
                  { value: 'vegetarien', label: 'Végétarien', emoji: '🥦' },
                  { value: 'vegan', label: 'Vegan', emoji: '🌱' },
                  { value: 'sans-gluten', label: 'Sans gluten', emoji: '🌾' },
                ].map((o) => (
                  <OptionCard key={o.value} label={o.label} emoji={o.emoji}
                    selected={dietRestrictions.includes(o.value)}
                    onPress={() => toggleRestriction(o.value)} />
                ))}
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Button
          label={step === TOTAL_STEPS ? 'Générer mon programme ✨' : 'Continuer →'}
          onPress={handleNext}
          variant={canContinue() ? 'green' : 'green'}
          disabled={!canContinue()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  progressContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepText: {
    color: Colors.textMuted,
    fontFamily: 'Nunito-Bold',
    fontSize: 13,
    marginLeft: Spacing.md,
    minWidth: 40,
  },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: Spacing.xl },
  stepContent: { flex: 1 },
  step: { paddingTop: Spacing.xl, gap: Spacing.lg },
  emoji: { fontSize: 48 },
  title: {
    fontSize: 30,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  options: { gap: Spacing.sm },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  optionCardSelected: {
    borderColor: Colors.green,
    backgroundColor: Colors.green + '15',
  },
  optionEmoji: { fontSize: 22 },
  optionLabel: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
  },
  optionLabelSelected: { color: Colors.textPrimary },
  checkmark: { fontSize: 18, color: Colors.green },
  inputs: { gap: Spacing.md },
  inputRow: { flexDirection: 'row', gap: Spacing.sm },
  inputGroup: { gap: Spacing.xs },
  inputLabel: {
    fontSize: 12,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: 'Nunito-Bold',
    fontSize: 16,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
    paddingTop: Spacing.md,
  },
});

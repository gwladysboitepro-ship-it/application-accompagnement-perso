import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { analyzeMealPhoto, MealAnalysis } from '../../lib/api/claude';
import { useStreakStore } from '../../lib/store/useStreak';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const ANALYSIS_MESSAGES = [
  '🧠 IA en cours d\'analyse...',
  '🥗 Identification des aliments...',
  '📊 Calcul des macros...',
  '✨ Finalisation...',
];

interface PhotoChallengeProps {
  onComplete: (xp: number) => void;
}

export function PhotoChallenge({ onComplete }: PhotoChallengeProps) {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<MealAnalysis | null>(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const { addMealPhoto, addXpToday } = useStreakStore();

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      handleImage(res.assets[0].base64 ?? '', 'image/jpeg');
      setImage(res.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      handleImage(res.assets[0].base64 ?? '', 'image/jpeg');
      setImage(res.assets[0].uri);
    }
  };

  const handleImage = async (base64: string, mimeType: string) => {
    setAnalyzing(true);
    const interval = setInterval(() => {
      setMsgIdx((i) => (i + 1) % ANALYSIS_MESSAGES.length);
    }, 800);

    try {
      const analysis = await analyzeMealPhoto(base64, mimeType);
      setResult(analysis);
    } finally {
      clearInterval(interval);
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    const canLog = addMealPhoto();
    if (canLog) {
      addXpToday(30);
      onComplete(30);
    } else {
      onComplete(0);
    }
  };

  if (result) {
    return (
      <View style={styles.result}>
        {image && <Image source={{ uri: image }} style={styles.resultImage} />}
        <View style={styles.macroGrid}>
          <MacroCard label="Calories" value={`${result.calories}`} unit="kcal" color={Colors.orange} />
          <MacroCard label="Protéines" value={`${result.proteines}`} unit="g" color={Colors.blue} />
          <MacroCard label="Glucides" value={`${result.glucides}`} unit="g" color={Colors.gold} />
          <MacroCard label="Lipides" value={`${result.lipides}`} unit="g" color={Colors.purple} />
        </View>
        <View style={styles.coachMessage}>
          <Text style={styles.coachText}>{result.coach_message}</Text>
        </View>
        <View style={styles.foodsList}>
          {result.foods.map((f, i) => (
            <Text key={i} style={styles.foodItem}>• {f.name} — {f.portion}</Text>
          ))}
        </View>
        <Button label="Parfait, enregistrer ✅" onPress={handleSave} variant="green" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.instruction}>Prends ton repas en photo</Text>

      {analyzing ? (
        <View style={styles.analyzing}>
          <ActivityIndicator color={Colors.green} size="large" />
          <Text style={styles.analyzingText}>{ANALYSIS_MESSAGES[msgIdx]}</Text>
        </View>
      ) : image ? (
        <Image source={{ uri: image }} style={styles.preview} />
      ) : (
        <View style={styles.photoZone}>
          <Text style={styles.photoIcon}>📷</Text>
          <Text style={styles.photoHint}>Tap pour ajouter une photo</Text>
        </View>
      )}

      {!analyzing && !result && (
        <View style={styles.buttons}>
          <Button label="📷 Prendre une photo" onPress={takePhoto} variant="blue" />
          <Button label="🖼️ Depuis la galerie" onPress={pickImage} variant="ghost" />
        </View>
      )}
    </View>
  );
}

function MacroCard({ label, value, unit, color }: { label: string; value: string; unit: string; color: string }) {
  return (
    <View style={[styles.macroCard, { borderColor: color + '44' }]}>
      <Text style={[styles.macroValue, { color }]}>{value}<Text style={styles.macroUnit}>{unit}</Text></Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  instruction: {
    fontSize: 22,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  photoZone: {
    height: 200,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  photoIcon: { fontSize: 48 },
  photoHint: { color: Colors.textMuted, fontFamily: 'Nunito-Bold', fontSize: 14 },
  preview: { height: 200, borderRadius: Radius.lg, width: '100%' },
  analyzing: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
  },
  analyzingText: { color: Colors.textSecondary, fontFamily: 'Nunito-Bold', fontSize: 15 },
  buttons: { gap: Spacing.sm },
  result: { gap: Spacing.md },
  resultImage: { height: 180, borderRadius: Radius.lg, width: '100%' },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  macroCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    gap: 2,
  },
  macroValue: { fontFamily: 'Fraunces-Black', fontSize: 22 },
  macroUnit: { fontSize: 13, fontFamily: 'Nunito-Bold', color: Colors.textSecondary },
  macroLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.textSecondary },
  coachMessage: {
    backgroundColor: Colors.green + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.green,
  },
  coachText: { color: Colors.green, fontFamily: 'Nunito-Bold', fontSize: 14, lineHeight: 22 },
  foodsList: { gap: 4 },
  foodItem: { color: Colors.textSecondary, fontFamily: 'Nunito-SemiBold', fontSize: 14 },
});

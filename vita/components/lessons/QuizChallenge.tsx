import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring, withTiming,
} from 'react-native-reanimated';
import { generateQuizQuestion, QuizQuestion } from '../../lib/api/claude';
import { useUserStore } from '../../lib/store/useUser';
import { Button } from '../ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const LETTERS = ['A', 'B', 'C', 'D'];

interface QuizChallengeProps {
  onComplete: (xp: number) => void;
}

export function QuizChallenge({ onComplete }: QuizChallengeProps) {
  const user = useUserStore((s) => s.user);
  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    setLoading(true);
    setSelected(null);
    try {
      const q = await generateQuizQuestion({
        goal: user?.goal ?? 'energie',
        level: user?.level ?? 0,
        recentFoods: [],
      });
      setQuestion(q);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (index: number) => {
    if (selected !== null) return;
    setSelected(index);
    if (index === question?.correct_index) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = async () => {
    if (questionCount >= 2) {
      const xp = score === 3 ? 50 : score >= 2 ? 40 : 30;
      onComplete(xp);
    } else {
      setQuestionCount((c) => c + 1);
      await loadQuestion();
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={Colors.gold} size="large" />
        <Text style={styles.loadingText}>Génération du quiz...</Text>
      </View>
    );
  }

  if (!question) return null;

  const answered = selected !== null;
  const correct = selected === question.correct_index;

  return (
    <View style={styles.container}>
      <View style={styles.progress}>
        <Text style={styles.progressText}>Question {questionCount + 1} / 3</Text>
        <Text style={styles.scoreText}>✨ {score * 10} XP</Text>
      </View>

      <Text style={styles.question}>{question.question}</Text>

      <View style={styles.choices}>
        {question.choices.map((choice, i) => (
          <ChoiceButton
            key={i}
            letter={LETTERS[i]}
            text={choice}
            state={
              !answered ? 'idle' :
              i === question.correct_index ? 'correct' :
              i === selected ? 'wrong' : 'idle'
            }
            onPress={() => handleSelect(i)}
          />
        ))}
      </View>

      {answered && (
        <View style={[styles.feedback, { backgroundColor: correct ? Colors.green + '20' : Colors.red + '20' }]}>
          <Text style={[styles.feedbackTitle, { color: correct ? Colors.green : Colors.red }]}>
            {correct ? '✅ Correct !' : '❌ Pas tout à fait...'}
          </Text>
          <Text style={styles.feedbackText}>{question.explanation}</Text>
          {correct && <Text style={styles.xpEarned}>+10 XP</Text>}
        </View>
      )}

      {answered && (
        <Button
          label={questionCount >= 2 ? `Terminer le quiz (${score}/3 ✅)` : 'Question suivante →'}
          onPress={handleNext}
          variant="gold"
        />
      )}
    </View>
  );
}

function ChoiceButton({
  letter, text, state, onPress,
}: { letter: string; text: string; state: 'idle' | 'correct' | 'wrong'; onPress: () => void }) {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.97, { damping: 20 }, () => {
      scale.value = withSpring(1);
    });
    onPress();
  };

  const borderColor = state === 'correct' ? Colors.green : state === 'wrong' ? Colors.red : Colors.border;
  const bg = state === 'correct' ? Colors.green + '20' : state === 'wrong' ? Colors.red + '20' : Colors.surface;

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={[styles.choice, { backgroundColor: bg, borderColor }]}
        onPress={state === 'idle' ? handlePress : undefined}
        activeOpacity={0.8}
      >
        <View style={[styles.choiceLetter, { backgroundColor: borderColor + '44' }]}>
          <Text style={[styles.choiceLetterText, { color: borderColor === Colors.border ? Colors.textSecondary : borderColor }]}>
            {letter}
          </Text>
        </View>
        <Text style={styles.choiceText}>{text}</Text>
        {state === 'correct' && <Text>✅</Text>}
        {state === 'wrong' && <Text>❌</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  loading: { alignItems: 'center', gap: Spacing.lg, paddingVertical: 60 },
  loadingText: { color: Colors.textSecondary, fontFamily: 'Nunito-Bold', fontSize: 15 },
  progress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.textSecondary },
  scoreText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: Colors.gold },
  question: {
    fontSize: 20,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    lineHeight: 28,
  },
  choices: { gap: Spacing.sm },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 2,
    gap: Spacing.md,
  },
  choiceLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceLetterText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14 },
  choiceText: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textPrimary },
  feedback: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  feedbackTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16 },
  feedbackText: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  xpEarned: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: Colors.gold },
});

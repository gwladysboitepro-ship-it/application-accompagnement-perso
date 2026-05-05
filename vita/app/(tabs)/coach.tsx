import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { chatWithCoach, ChatMessage } from '../../lib/api/claude';
import { useUserStore } from '../../lib/store/useUser';
import { useStreakStore } from '../../lib/store/useStreak';
import { Colors, Spacing, Radius } from '../../constants/theme';

const QUICK_CHIPS = [
  'Comment améliorer mon sommeil ?',
  'Que manger avant le sport ?',
  'Comment couper les fringales ?',
  'Pourquoi mon poids stagne ?',
  'Quel sport pour débutant ?',
  'Comment boire plus d\'eau ?',
];

function TypingIndicator() {
  const [dots, setDots] = useState('•');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((d) => d.length >= 3 ? '•' : d + '•');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.typingBubble}>
      <Text style={styles.typingDots}>{dots}</Text>
    </View>
  );
}

export default function CoachScreen() {
  const user = useUserStore((s) => s.user);
  const { coachMessagesUsed, useCoachMessage } = useStreakStore();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: `Bonjour ${user?.name ?? 'champion'} ! 👋 Je suis Coach VITA, ton expert santé personnel. Comment puis-je t'aider aujourd'hui ? 💪`,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isPremium = user?.isPremium ?? false;
  const remaining = isPremium ? Infinity : Math.max(0, 5 - coachMessagesUsed);
  const canSend = remaining > 0 || isPremium;

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !canSend) return;
    if (!isPremium && !useCoachMessage()) return;

    const userMsg: ChatMessage = { role: 'user', content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await chatWithCoach(newMessages, {
        name: user?.name ?? 'Utilisateur',
        streak: user?.streakCount ?? 0,
        goal: user?.goal ?? 'santé',
        vitaScore: user?.vitaScore ?? 0,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.coachAvatar}>
          <Text style={styles.coachEmoji}>🤖</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Coach VITA</Text>
          <Text style={styles.headerStatus}>🟢 En ligne</Text>
        </View>
        {!isPremium && (
          <View style={styles.limitBadge}>
            <Text style={styles.limitText}>{remaining}/5</Text>
          </View>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={styles.messages}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {loading && <TypingIndicator />}
      </ScrollView>

      {/* Quick chips */}
      {messages.length <= 2 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
          contentContainerStyle={styles.chipsContent}
        >
          {QUICK_CHIPS.map((chip) => (
            <TouchableOpacity
              key={chip}
              style={styles.chip}
              onPress={() => sendMessage(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Input */}
      <View style={styles.inputArea}>
        {!canSend && (
          <View style={styles.limitWarning}>
            <Text style={styles.limitWarningText}>
              💎 Limite atteinte. Passe Premium pour des messages illimités !
            </Text>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder={canSend ? 'Pose ta question...' : 'Passe Premium...'}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={500}
            editable={canSend}
            onSubmitEditing={() => sendMessage(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || !canSend) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || !canSend || loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <Text style={styles.sendIcon}>↑</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';
  return (
    <View style={[styles.bubbleRow, isAssistant ? styles.bubbleRowLeft : styles.bubbleRowRight]}>
      {isAssistant && (
        <View style={styles.avatarSmall}>
          <Text style={{ fontSize: 14 }}>🤖</Text>
        </View>
      )}
      <View style={[styles.bubble, isAssistant ? styles.bubbleAssistant : styles.bubbleUser]}>
        <Text style={[styles.bubbleText, isAssistant ? styles.bubbleTextAssistant : styles.bubbleTextUser]}>
          {message.content}
        </Text>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  coachAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.purple + '33',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.purple,
  },
  coachEmoji: { fontSize: 22 },
  headerInfo: { flex: 1, gap: 2 },
  headerTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: Colors.textPrimary },
  headerStatus: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.green },
  limitBadge: {
    backgroundColor: Colors.gold + '22',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.gold,
  },
  limitText: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: Colors.gold },
  messages: { flex: 1 },
  messagesContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: 20,
  },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: Spacing.sm },
  bubbleRowLeft: { justifyContent: 'flex-start' },
  bubbleRowRight: { justifyContent: 'flex-end' },
  avatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.purple + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  bubbleAssistant: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: Colors.green,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 15, lineHeight: 22, fontFamily: 'Nunito-SemiBold' },
  bubbleTextAssistant: { color: Colors.textPrimary },
  bubbleTextUser: { color: '#FFFFFF' },
  typingBubble: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  typingDots: { fontSize: 18, color: Colors.textSecondary, letterSpacing: 4 },
  chipsScroll: { maxHeight: 50 },
  chipsContent: {
    paddingHorizontal: Spacing.xl,
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  chip: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  inputArea: { paddingHorizontal: Spacing.xl, paddingBottom: 24, paddingTop: Spacing.sm, gap: Spacing.sm },
  limitWarning: {
    backgroundColor: Colors.gold + '15',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  limitWarningText: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.gold, textAlign: 'center' },
  inputRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'flex-end' },
  input: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.md,
    color: Colors.textPrimary,
    fontFamily: 'Nunito-SemiBold',
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.textMuted },
  sendIcon: { fontSize: 20, color: '#FFF', fontFamily: 'Nunito-ExtraBold' },
});

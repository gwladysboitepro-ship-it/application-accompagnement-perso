import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useUserStore, getLevelTitle, getNextLevelXp } from '../../lib/store/useUser';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';

const ALL_BADGES = [
  { id: 'streak7', emoji: '🔥', name: 'Streak 7 jours', desc: '7 jours consécutifs', xp: 100 },
  { id: 'photographer', emoji: '📸', name: 'Photographe', desc: '10 repas en photo', xp: 50 },
  { id: 'hydrated', emoji: '💧', name: 'Hydraté', desc: 'Objectif eau 7j de suite', xp: 75 },
  { id: 'athlete', emoji: '💪', name: 'Athlète', desc: '20 séances sport', xp: 150 },
  { id: 'nightperfect', emoji: '🌙', name: 'Nuit parfaite', desc: '7h+ de sommeil 5 nuits', xp: 75 },
  { id: 'score80', emoji: '⚡', name: 'Score 80', desc: 'Atteindre Score VITA 80', xp: 200 },
  { id: 'streak30', emoji: '🏆', name: '30 jours', desc: 'Streak de 30 jours', xp: 500 },
  { id: 'firstmeal', emoji: '🍽️', name: 'Premier repas', desc: 'Logger ton premier repas', xp: 20 },
  { id: 'firstsport', emoji: '🏋️', name: 'Première séance', desc: 'Compléter une séance sport', xp: 30 },
];

export default function ProfileScreen() {
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  if (!user) return null;

  const levelTitle = getLevelTitle(user.level);
  const nextLevelXp = getNextLevelXp(user.level);
  const prevLevelXp = [0, 100, 250, 500, 1000, 2000, 5000, 10000][user.level] ?? 0;
  const progressToNext = (user.totalXp - prevLevelXp) / (nextLevelXp - prevLevelXp);

  // Simulate earned badges
  const earnedBadgeIds = new Set(['firstmeal']);
  if (user.streakCount >= 7) earnedBadgeIds.add('streak7');
  if (user.streakCount >= 30) earnedBadgeIds.add('streak30');
  if (user.vitaScore >= 80) earnedBadgeIds.add('score80');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Profil header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{user.name[0].toUpperCase()}</Text>
        </View>
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{levelTitle}</Text>
          <Text style={styles.levelNum}>Niv. {user.level}</Text>
        </View>
      </View>

      {/* XP + progression */}
      <View style={styles.xpCard}>
        <View style={styles.xpRow}>
          <Text style={styles.xpValue}>⚡ {user.totalXp} XP</Text>
          <Text style={styles.xpNext}>{nextLevelXp - user.totalXp} XP → Niv. {user.level + 1}</Text>
        </View>
        <ProgressBar progress={progressToNext} color={Colors.gold} height={10} />
      </View>

      {/* Stats principales */}
      <View style={styles.statsGrid}>
        <StatCard emoji="🔥" label="Streak" value={`${user.streakCount}j`} color={Colors.orange} />
        <StatCard emoji="📊" label="Score VITA" value={`${user.vitaScore}/100`} color={Colors.green} />
        <StatCard emoji="⚖️" label="Objectif" value={user.goal} color={Colors.blue} />
        <StatCard emoji="🎯" label="Kcal/jour" value={`${user.kcalTarget}`} color={Colors.red} />
      </View>

      {/* Programme */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mon programme</Text>
        <View style={styles.programCard}>
          <ProgramRow emoji="💪" label="Protéines" value={`${user.proteinTarget}g / jour`} />
          <ProgramRow emoji="🌾" label="Glucides" value={`${user.carbTarget}g / jour`} />
          <ProgramRow emoji="🥑" label="Lipides" value={`${user.fatTarget}g / jour`} />
          <ProgramRow emoji="🏋️" label="Sport" value={`${user.workoutsPerWeek}x / semaine`} />
          <ProgramRow emoji="😴" label="Sommeil" value={`${user.sleepTarget}h / nuit`} />
        </View>
      </View>

      {/* Badges */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Badges ({earnedBadgeIds.size}/{ALL_BADGES.length})</Text>
        <View style={styles.badgeGrid}>
          {ALL_BADGES.map((badge) => {
            const earned = earnedBadgeIds.has(badge.id);
            return (
              <View key={badge.id} style={[styles.badgeCard, !earned && styles.badgeCardLocked]}>
                <Text style={[styles.badgeEmoji, !earned && styles.badgeEmojiLocked]}>
                  {earned ? badge.emoji : '🔒'}
                </Text>
                <Text style={[styles.badgeName, !earned && styles.badgeNameLocked]}>
                  {badge.name}
                </Text>
                {earned && <Text style={styles.badgeXp}>+{badge.xp} XP</Text>}
              </View>
            );
          })}
        </View>
      </View>

      {/* Premium */}
      {!user.isPremium && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumEmoji}>💎</Text>
          <Text style={styles.premiumTitle}>Passe Premium</Text>
          <Text style={styles.premiumSubtitle}>Photos illimitées · Coach IA illimité · Streak freeze</Text>
          <Button label="Essai gratuit 7 jours →" onPress={() => {}} variant="gold" />
          <Text style={styles.premiumPrice}>4,99€/mois · Sans engagement</Text>
        </View>
      )}

      {/* Déconnexion */}
      <Button label="Se déconnecter" onPress={logout} variant="ghost" />
    </ScrollView>
  );
}

function StatCard({ emoji, label, value, color }: { emoji: string; label: string; value: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderColor: color + '44' }]}>
      <Text style={styles.statEmoji}>{emoji}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ProgramRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <View style={styles.programRow}>
      <Text style={styles.programEmoji}>{emoji}</Text>
      <Text style={styles.programLabel}>{label}</Text>
      <Text style={styles.programValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  content: { paddingHorizontal: Spacing.xl, paddingTop: 55, paddingBottom: 100, gap: Spacing.xl },
  profileHeader: { alignItems: 'center', gap: Spacing.md },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.greenDark,
  },
  avatarText: { fontSize: 36, color: '#131F24', fontFamily: 'Fraunces-Black' },
  name: { fontSize: 28, fontFamily: 'Fraunces-Black', color: Colors.textPrimary },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gold + '22',
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  levelText: { fontFamily: 'Nunito-ExtraBold', fontSize: 14, color: Colors.gold },
  levelNum: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  xpCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  xpRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpValue: { fontFamily: 'Nunito-ExtraBold', fontSize: 18, color: Colors.gold },
  xpNext: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textMuted },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontFamily: 'Fraunces-Black', fontSize: 20 },
  statLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: Colors.textSecondary, textAlign: 'center' },
  section: { gap: Spacing.md },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  programCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  programRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  programEmoji: { fontSize: 20, width: 28 },
  programLabel: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 15, color: Colors.textSecondary },
  programValue: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: Colors.textPrimary },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  badgeCard: {
    width: '30%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  badgeCardLocked: { borderColor: Colors.border, opacity: 0.5 },
  badgeEmoji: { fontSize: 28 },
  badgeEmojiLocked: { opacity: 0.5 },
  badgeName: { fontFamily: 'Nunito-Bold', fontSize: 11, color: Colors.textPrimary, textAlign: 'center' },
  badgeNameLocked: { color: Colors.textMuted },
  badgeXp: { fontFamily: 'Nunito-ExtraBold', fontSize: 11, color: Colors.gold },
  premiumBanner: {
    backgroundColor: Colors.gold + '10',
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.gold + '44',
  },
  premiumEmoji: { fontSize: 36 },
  premiumTitle: { fontSize: 22, fontFamily: 'Fraunces-Black', color: Colors.gold },
  premiumSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  premiumPrice: { fontSize: 12, fontFamily: 'Nunito-SemiBold', color: Colors.textMuted },
});

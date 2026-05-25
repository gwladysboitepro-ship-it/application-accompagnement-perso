import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { useUserStore, getLevelTitle, getNextLevelXp } from '../../lib/store/useUser';
import { PremiumModal } from '../../components/premium/PremiumModal';
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
  const [showPremium, setShowPremium] = useState(false);

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

      {/* Premium banner — ✅ Guideline 2.3.2 : paid features clearly labelled */}
      {!user.isPremium && (
        <View style={styles.premiumBanner}>
          <Text style={styles.premiumEmoji}>💎</Text>
          <Text style={styles.premiumTitle}>VITA Premium — Achat requis</Text>
          <Text style={styles.premiumSubtitle}>
            Les fonctionnalités suivantes nécessitent un abonnement payant :{'\n'}
            Photos illimitées · Coach IA illimité · Streak Freeze · Quiz IA · Sommeil avancé
          </Text>
          {/* ✅ APPLE RULE: billed amount most prominent */}
          <View style={styles.pricingBlock}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Annuel (meilleure offre)</Text>
              <Text style={styles.pricingAmount}>35,88 € / an</Text>
            </View>
            <Text style={styles.pricingPerMonth}>soit 2,99 € / mois</Text>
            <View style={[styles.pricingRow, { marginTop: 8 }]}>
              <Text style={styles.pricingLabel}>Mensuel</Text>
              <Text style={styles.pricingAmount}>4,99 € / mois</Text>
            </View>
            <Text style={styles.pricingTrial}>7 jours d'essai gratuit inclus</Text>
          </View>
          <Button
            label="Voir les offres Premium"
            onPress={() => setShowPremium(true)}
            variant="gold"
          />
        </View>
      )}

      {/* Legal links — ✅ Required by Apple */}
      <View style={styles.legalRow}>
        <TouchableOpacity onPress={() => router.push('/legal/privacy')}>
          <Text style={styles.legalLink}>Politique de confidentialité</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => router.push('/legal/terms')}>
          <Text style={styles.legalLink}>CGU & EULA</Text>
        </TouchableOpacity>
      </View>

      {/* Déconnexion */}
      <Button label="Se déconnecter" onPress={logout} variant="ghost" />

      {/* Premium Modal */}
      <PremiumModal
        visible={showPremium}
        onClose={() => setShowPremium(false)}
      />
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
  premiumTitle: { fontSize: 20, fontFamily: 'Fraunces-Black', color: Colors.gold },
  premiumSubtitle: {
    fontSize: 13,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  // ✅ Pricing block — billed amount most prominent per Apple 3.1.2(c)
  pricingBlock: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pricingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pricingLabel: { fontFamily: 'Nunito-SemiBold', fontSize: 13, color: Colors.textSecondary },
  pricingAmount: { fontFamily: 'Fraunces-Black', fontSize: 18, color: Colors.textPrimary },
  pricingPerMonth: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: Colors.textMuted, textAlign: 'right' },
  pricingTrial: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.green, marginTop: 4 },
  legalRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legalLink: { fontFamily: 'Nunito-Bold', fontSize: 12, color: Colors.textMuted, textDecorationLine: 'underline' },
  legalSep: { color: Colors.textMuted, fontSize: 12 },
});

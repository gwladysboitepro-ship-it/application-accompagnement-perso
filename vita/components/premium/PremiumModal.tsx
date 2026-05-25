import React, { useState, useEffect } from 'react';
import {
  Modal, View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, Linking,
} from 'react-native';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { purchaseMonthly, purchaseAnnual, restorePurchases } from '../../lib/revenuecat';
import { useUserStore } from '../../lib/store/useUser';

interface PremiumModalProps {
  visible: boolean;
  onClose: () => void;
  trigger?: string; // what triggered the paywall (for context)
}

type Plan = 'annual' | 'monthly';

const FEATURES = [
  { emoji: '📸', label: 'Photos repas illimitées', free: '1/jour', premium: 'Illimité' },
  { emoji: '🤖', label: 'Messages Coach IA', free: '5/jour', premium: 'Illimité' },
  { emoji: '🔥', label: 'Streak Freeze', free: '❌', premium: '2/semaine' },
  { emoji: '🧠', label: 'Quiz IA personnalisés', free: 'Questions fixes', premium: '✅ Personnalisés' },
  { emoji: '😴', label: 'Analyse sommeil avancée', free: '❌', premium: '✅' },
];

export function PremiumModal({ visible, onClose, trigger }: PremiumModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<Plan>('annual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const updateUser = useUserStore((s) => s.updateUser);

  const handlePurchase = async () => {
    setError('');
    setLoading(true);
    try {
      const success = selectedPlan === 'annual'
        ? await purchaseAnnual()
        : await purchaseMonthly();

      if (success) {
        const expiry = new Date(
          Date.now() + (selectedPlan === 'annual' ? 365 : 30) * 86400000
        ).toISOString();
        updateUser({ isPremium: true, premiumUntil: expiry });
        onClose();
      } else {
        setError('L\'achat n\'a pas pu aboutir. Vérifie ta connexion et réessaie.');
      }
    } catch (e: any) {
      // User cancelled — don't show error
      if (!e?.userCancelled) {
        setError('Une erreur est survenue. Réessaie.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    const restored = await restorePurchases();
    if (restored) {
      updateUser({ isPremium: true });
      onClose();
    } else {
      setError('Aucun abonnement actif trouvé.');
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>VITA Premium 💎</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {/* Hero */}
          <Text style={styles.heroTitle}>Débloque tout le potentiel{'\n'}de VITA</Text>
          {trigger && (
            <View style={styles.triggerBadge}>
              <Text style={styles.triggerText}>🔒 {trigger} est une fonctionnalité Premium</Text>
            </View>
          )}

          {/* Plan selector */}
          <View style={styles.planSection}>
            {/* ANNUAL — highlighted first, billed amount most prominent */}
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.8}
            >
              <View style={styles.planBadgeRow}>
                <View style={styles.bestValueBadge}>
                  <Text style={styles.bestValueText}>MEILLEURE OFFRE</Text>
                </View>
                <Text style={styles.trialBadge}>7 jours gratuits</Text>
              </View>

              <View style={styles.planContent}>
                <View>
                  <Text style={styles.planName}>Premium Annuel</Text>
                  {/* ✅ APPLE RULE: billed amount is THE most prominent element */}
                  <Text style={styles.billedAmountLarge}>35,88 €</Text>
                  <Text style={styles.billedPeriod}>facturé annuellement</Text>
                  {/* Monthly equivalent in SMALLER subordinate text */}
                  <Text style={styles.perMonthSmall}>soit 2,99 € / mois</Text>
                </View>
                <View style={[styles.radioOuter, selectedPlan === 'annual' && styles.radioOuterSelected]}>
                  {selectedPlan === 'annual' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>

            {/* MONTHLY */}
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'monthly' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('monthly')}
              activeOpacity={0.8}
            >
              <View style={styles.planContent}>
                <View>
                  <Text style={styles.planName}>Premium Mensuel</Text>
                  {/* ✅ APPLE RULE: billed amount most prominent */}
                  <Text style={styles.billedAmountLarge}>4,99 €</Text>
                  <Text style={styles.billedPeriod}>facturé chaque mois</Text>
                  <Text style={styles.trialSmall}>7 jours gratuits</Text>
                </View>
                <View style={[styles.radioOuter, selectedPlan === 'monthly' && styles.radioOuterSelected]}>
                  {selectedPlan === 'monthly' && <View style={styles.radioInner} />}
                </View>
              </View>
            </TouchableOpacity>
          </View>

          {/* Feature comparison */}
          <View style={styles.features}>
            <Text style={styles.featuresTitle}>Ce que tu débloque</Text>
            {FEATURES.map((f) => (
              <View key={f.label} style={styles.featureRow}>
                <Text style={styles.featureEmoji}>{f.emoji}</Text>
                <Text style={styles.featureLabel}>{f.label}</Text>
                <View style={styles.featureValues}>
                  <Text style={styles.featureFree}>{f.free}</Text>
                  <Text style={styles.featurePremium}>{f.premium}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Error */}
          {error !== '' && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {error}</Text>
            </View>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[styles.ctaBtn, loading && styles.ctaBtnLoading]}
            onPress={handlePurchase}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>
                  {selectedPlan === 'annual'
                    ? 'Commencer — 7 jours gratuits'
                    : 'Commencer — 7 jours gratuits'}
                </Text>
                <Text style={styles.ctaSub}>
                  {selectedPlan === 'annual'
                    ? 'Puis 35,88 € / an — annulable à tout moment'
                    : 'Puis 4,99 € / mois — annulable à tout moment'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* ✅ APPLE REQUIRED: Subscription terms disclosure */}
          <View style={styles.termsBox}>
            <Text style={styles.termsText}>
              {selectedPlan === 'annual'
                ? '• Abonnement : VITA Premium Annuel\n• Durée : 1 an\n• Prix facturé : 35,88 € / an\n• Renouvellement automatique sauf résiliation 24h avant la date de renouvellement'
                : '• Abonnement : VITA Premium Mensuel\n• Durée : 1 mois\n• Prix facturé : 4,99 € / mois\n• Renouvellement automatique sauf résiliation 24h avant la date de renouvellement'}
              {'\n'}• L'essai gratuit de 7 jours commence à l'activation. Aucun débit pendant la période d'essai.
              {'\n'}• Le paiement est débité sur ton compte Apple ID à la confirmation d'achat.
              {'\n'}• Gérer tes abonnements dans les Réglages de ton compte Apple ID.
            </Text>
          </View>

          {/* ✅ APPLE REQUIRED: Links to Privacy Policy and Terms of Use */}
          <View style={styles.legalLinks}>
            <TouchableOpacity onPress={() => Linking.openURL('https://vita-app.co/privacy')}>
              <Text style={styles.legalLink}>Politique de confidentialité</Text>
            </TouchableOpacity>
            <Text style={styles.legalSep}>•</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://vita-app.co/terms')}>
              <Text style={styles.legalLink}>Conditions d'utilisation (EULA)</Text>
            </TouchableOpacity>
          </View>

          {/* Restore */}
          <TouchableOpacity onPress={handleRestore} disabled={loading}>
            <Text style={styles.restoreText}>Restaurer mes achats</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: 20,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { color: Colors.textSecondary, fontSize: 14, fontFamily: 'Nunito-ExtraBold' },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Nunito-ExtraBold',
    fontSize: 18,
    color: Colors.textPrimary,
    marginRight: 32,
  },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 60 },
  heroTitle: {
    fontSize: 26,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    textAlign: 'center',
    lineHeight: 34,
  },
  triggerBadge: {
    backgroundColor: Colors.gold + '22',
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.gold + '44',
  },
  triggerText: { color: Colors.gold, fontFamily: 'Nunito-Bold', fontSize: 13, textAlign: 'center' },

  // Plans
  planSection: { gap: Spacing.sm },
  planCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  planCardSelected: { borderColor: Colors.gold, backgroundColor: Colors.gold + '0D' },
  planBadgeRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  bestValueBadge: {
    backgroundColor: Colors.gold,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  bestValueText: { color: '#131F24', fontFamily: 'Nunito-ExtraBold', fontSize: 10 },
  trialBadge: { color: Colors.green, fontFamily: 'Nunito-ExtraBold', fontSize: 12 },
  trialSmall: { color: Colors.green, fontFamily: 'Nunito-Bold', fontSize: 12, marginTop: 2 },
  planContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: Colors.textPrimary, marginBottom: 4 },

  // ✅ APPLE RULE: billed amount = largest, most prominent text
  billedAmountLarge: {
    fontFamily: 'Fraunces-Black',
    fontSize: 32,
    color: Colors.textPrimary,
    lineHeight: 36,
  },
  billedPeriod: { fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  // ✅ APPLE RULE: per-month shown SMALLER and subordinate
  perMonthSmall: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: { borderColor: Colors.gold },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Colors.gold },

  // Features
  features: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featuresTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 15, color: Colors.textPrimary },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureEmoji: { fontSize: 18, width: 26 },
  featureLabel: { flex: 1, fontFamily: 'Nunito-Bold', fontSize: 13, color: Colors.textSecondary },
  featureValues: { alignItems: 'flex-end', gap: 2 },
  featureFree: { fontFamily: 'Nunito-SemiBold', fontSize: 11, color: Colors.textMuted },
  featurePremium: { fontFamily: 'Nunito-ExtraBold', fontSize: 12, color: Colors.green },

  // Error
  errorBox: {
    backgroundColor: Colors.red + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.red + '44',
  },
  errorText: { color: Colors.red, fontFamily: 'Nunito-Bold', fontSize: 14 },

  // CTA
  ctaBtn: {
    backgroundColor: Colors.gold,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: 4,
    minHeight: 60,
    justifyContent: 'center',
    shadowColor: '#CC9E00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  ctaBtnLoading: { opacity: 0.7 },
  ctaText: { fontFamily: 'Nunito-ExtraBold', fontSize: 17, color: '#131F24' },
  ctaSub: { fontFamily: 'Nunito-SemiBold', fontSize: 12, color: '#131F24AA' },

  // ✅ APPLE REQUIRED: Subscription terms
  termsBox: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  termsText: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 18,
  },

  // ✅ APPLE REQUIRED: Legal links
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  legalLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 12,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSep: { color: Colors.textMuted, fontSize: 12 },

  restoreText: {
    textAlign: 'center',
    fontFamily: 'Nunito-SemiBold',
    fontSize: 13,
    color: Colors.textMuted,
    textDecorationLine: 'underline',
  },
});

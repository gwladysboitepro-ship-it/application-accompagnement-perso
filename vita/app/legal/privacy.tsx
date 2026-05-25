import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';

const SECTIONS = [
  {
    title: '1. Données collectées',
    content: `VITA collecte les données suivantes pour te fournir un coaching personnalisé :
• Données de profil : prénom, âge, poids, taille, objectifs santé
• Données d'activité : photos de repas, logs d'eau, sommeil, séances sport
• Données d'utilisation : progression, XP, streak, badges
• Données de facturation : gérées exclusivement par Apple (RevenueCat). VITA ne stocke jamais tes coordonnées bancaires.
• Identifiant Apple : utilisé uniquement pour l'authentification (Sign in with Apple).`,
  },
  {
    title: '2. Utilisation des données',
    content: `Tes données sont utilisées pour :
• Générer et afficher ton programme santé personnalisé
• Faire analyser tes repas par l'IA (Claude Anthropic) — les photos sont envoyées chiffrées et ne sont pas conservées par Anthropic
• Calculer ton Score VITA quotidien
• T'envoyer des notifications de rappel (avec ton consentement)
• Améliorer nos services de façon anonymisée

Nous ne vendons jamais tes données à des tiers.`,
  },
  {
    title: '3. Stockage et sécurité',
    content: `Tes données sont stockées sur Supabase (serveurs UE, conformes RGPD). Les communications sont chiffrées en TLS 1.3. Les photos de repas sont supprimées de nos serveurs sous 24h après analyse.`,
  },
  {
    title: '4. Tes droits (RGPD)',
    content: `Tu as le droit de :
• Accéder à tes données (profil → Mes données)
• Corriger tes données (profil → Modifier)
• Supprimer ton compte et toutes tes données (profil → Supprimer mon compte)
• Exporter tes données au format JSON (profil → Exporter)
• Retirer ton consentement aux notifications à tout moment

Pour exercer ces droits : privacy@vita-app.co`,
  },
  {
    title: '5. Cookies et analytics',
    content: `VITA utilise Mixpanel pour des analytics anonymisées (taux de rétention, fonctionnalités utilisées). Aucun cookie de tracking tiers. Tu peux désactiver les analytics dans Réglages → Vie privée.`,
  },
  {
    title: '6. Données des mineurs',
    content: `VITA est destiné aux personnes de 17 ans et plus. Nous ne collectons pas sciemment de données de mineurs. Si tu es parent et penses que ton enfant a créé un compte, contacte-nous à privacy@vita-app.co.`,
  },
  {
    title: '7. Contact',
    content: `Responsable du traitement : VITA SAS\nEmail : privacy@vita-app.co\nMise à jour : 25 mai 2026`,
  },
];

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Politique de confidentialité</Text>
        <Text style={styles.subtitle}>Dernière mise à jour : 25 mai 2026</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.intro}>
          VITA s'engage à protéger ta vie privée. Ce document explique quelles données nous collectons,
          pourquoi, et comment tu peux les contrôler.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 55,
    paddingBottom: Spacing.lg,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.sm },
  backText: { color: Colors.textSecondary, fontFamily: 'Nunito-Bold', fontSize: 15 },
  title: { fontFamily: 'Fraunces-Black', fontSize: 24, color: Colors.textPrimary },
  subtitle: { fontFamily: 'Nunito-SemiBold', fontSize: 13, color: Colors.textMuted },
  scroll: { flex: 1 },
  content: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 60 },
  intro: {
    fontFamily: 'Nunito-SemiBold',
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  sectionContent: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
});

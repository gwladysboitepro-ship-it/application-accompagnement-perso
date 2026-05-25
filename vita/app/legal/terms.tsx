import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '../../constants/theme';

const SECTIONS = [
  {
    title: '1. Objet',
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'utilisation de l'application mobile VITA Health (ci-après "VITA"), éditée par VITA SAS. En utilisant VITA, tu acceptes ces conditions dans leur intégralité.`,
  },
  {
    title: '2. Description du service',
    content: `VITA est une application mobile de coaching santé par intelligence artificielle. Elle propose :
• Un programme nutrition et sport personnalisé par IA
• L'analyse de photos de repas par intelligence artificielle
• Un coach IA disponible par messagerie
• Un suivi de l'hydratation, du sommeil et de l'activité physique
• Un système de gamification (XP, streak, badges, score VITA)

⚠️ VITA n'est pas un dispositif médical. Les conseils fournis par l'IA ne remplacent pas l'avis d'un professionnel de santé.`,
  },
  {
    title: '3. Abonnements Premium',
    content: `Certaines fonctionnalités nécessitent un abonnement payant (Premium) :
• Photos de repas illimitées (gratuit : 1/jour)
• Messages Coach IA illimités (gratuit : 5/jour)
• Streak Freeze (2/semaine)
• Quiz IA personnalisés
• Analyse sommeil avancée

Tarifs :
• Premium Mensuel : 4,99 € / mois (facturé mensuellement)
• Premium Annuel : 35,88 € / an (facturé annuellement, soit 2,99 €/mois)

Les deux offres incluent 7 jours d'essai gratuit. Le paiement est prélevé sur le compte Apple ID à la fin de la période d'essai. L'abonnement se renouvelle automatiquement sauf résiliation au moins 24h avant la date de renouvellement.

Pour gérer ou annuler ton abonnement : Réglages iPhone → ton nom → Abonnements → VITA.`,
  },
  {
    title: '4. Propriété intellectuelle',
    content: `L'ensemble des contenus de VITA (textes, images, code, algorithmes, design) est la propriété exclusive de VITA SAS et est protégé par le droit d'auteur. Toute reproduction sans autorisation est interdite.`,
  },
  {
    title: '5. Responsabilité',
    content: `VITA fournit des conseils généraux basés sur les données que tu fournis. Ces conseils ne constituent pas un avis médical professionnel. Tu es seul(e) responsable des décisions prises sur la base des recommandations de VITA. Consulte un professionnel de santé pour tout problème médical.`,
  },
  {
    title: '6. Résiliation',
    content: `Tu peux supprimer ton compte à tout moment depuis Profil → Supprimer mon compte. En cas de suppression, toutes tes données sont effacées sous 30 jours conformément au RGPD. Les abonnements en cours ne sont pas remboursés prorata temporis sauf obligation légale.`,
  },
  {
    title: '7. Droit applicable',
    content: `Ces CGU sont soumises au droit français. Tout litige sera soumis à la compétence des tribunaux de Paris. Pour toute question : support@vita-app.co`,
  },
  {
    title: '8. EULA Apple',
    content: `L'accord de licence standard Apple (EULA) s'applique à VITA. Consulte-le à l'adresse : https://www.apple.com/legal/internet-services/itunes/dev/stdeula/`,
  },
];

export default function TermsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Conditions d'utilisation</Text>
        <Text style={styles.subtitle}>Dernière mise à jour : 25 mai 2026</Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚕️ VITA n'est pas un dispositif médical. Les conseils de l'IA ne remplacent pas l'avis d'un médecin.
          </Text>
        </View>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
            {section.title === '8. EULA Apple' && (
              <TouchableOpacity
                onPress={() => Linking.openURL('https://www.apple.com/legal/internet-services/itunes/dev/stdeula/')}
              >
                <Text style={styles.eulaLink}>
                  Consulter l'EULA Apple standard →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <View style={styles.contact}>
          <Text style={styles.contactText}>Questions ? support@vita-app.co</Text>
        </View>
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
  warningBox: {
    backgroundColor: Colors.orange + '15',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.orange + '44',
  },
  warningText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.orange, lineHeight: 20 },
  section: { gap: Spacing.sm },
  sectionTitle: { fontFamily: 'Nunito-ExtraBold', fontSize: 16, color: Colors.textPrimary },
  sectionContent: { fontFamily: 'Nunito-SemiBold', fontSize: 14, color: Colors.textSecondary, lineHeight: 22 },
  eulaLink: {
    fontFamily: 'Nunito-Bold',
    fontSize: 14,
    color: Colors.blue,
    textDecorationLine: 'underline',
    marginTop: Spacing.xs,
  },
  contact: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  contactText: { fontFamily: 'Nunito-Bold', fontSize: 14, color: Colors.textSecondary },
});

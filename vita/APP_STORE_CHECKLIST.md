# VITA — Checklist App Store Connect
## Corrections pour resoumission (suite refus Apple du 25 mai 2026)

---

## ✅ Corrections dans le code (déjà faites)

| Problème Apple | Correction appliquée |
|---|---|
| **2.1(a)** — Sign in with Apple cassé | Implémentation complète `expo-apple-authentication` + auth email/password Supabase |
| **3.1.2(c)** — Prix mensuel trop visible | Montant facturé (35,88€/an ou 4,99€/mois) désormais le plus grand et le plus visible. Prix/mois affiché en petit texte subordonné |
| **2.1(b)** — Erreur à l'achat | RevenueCat correctement initialisé avec gestion d'erreurs et UI de fallback |
| **2.1(b)** — IAP non soumis | Voir checklist App Store Connect ci-dessous |
| **3.1.2(c)** — Liens EULA/Privacy manquants | Liens fonctionnels dans le paywall ET dans l'onglet Profil. Pages in-app `/legal/privacy` et `/legal/terms` créées |
| **2.3.2** — Features payantes non identifiées | Toutes les features Premium clairement labellisées "Achat requis" dans l'UI |

---

## 📋 Actions à faire dans App Store Connect

### 1. Soumettre les In-App Purchases (OBLIGATOIRE)

Dans App Store Connect → Mon App → In-App Purchases :

**Produit 1 : VITA Premium Mensuel**
- Type : Auto-Renewable Subscription
- ID produit : `vita_monthly`
- Nom (affiché) : `VITA Premium Mensuel`
- Prix : 4,99 € (Tier 5)
- Durée : 1 mois
- Période d'essai gratuite : 7 jours
- Description (App Review) : "Accès illimité aux photos repas IA, messages Coach IA, Streak Freeze et quiz personnalisés"
- Screenshot App Review : capture d'écran du paywall dans l'app
- **→ Cliquer "Soumettre pour révision"** ⚠️

**Produit 2 : VITA Premium Annuel**
- Type : Auto-Renewable Subscription
- ID produit : `vita_annual`
- Nom (affiché) : `VITA Premium Annuel`
- Prix : 35,88 € (Tier correspondant)
- Durée : 1 an
- Période d'essai gratuite : 7 jours
- Description (App Review) : "Accès illimité à toutes les fonctionnalités VITA pendant 1 an"
- Screenshot App Review : même capture que le mensuel
- **→ Cliquer "Soumettre pour révision"** ⚠️

### 2. Accepter le Paid Apps Agreement

App Store Connect → Accords, taxes et opérations bancaires → **Paid Apps** → Accepter si pas encore fait.

### 3. Mettre à jour la description App Store

Remplacer la description actuelle par celle-ci :

```
🌿 VITA — Coach Santé IA Personnalisé

Transforme ta santé avec l'intelligence artificielle. VITA combine nutrition, sport, sommeil et bien-être dans une expérience unique inspirée de Duolingo.

📸 ANALYSE PHOTO REPAS (IA)
Prends ton repas en photo — VITA identifie les aliments et calcule tes macros en secondes.

🤖 COACH IA PERSONNALISÉ
Pose toutes tes questions à ton coach santé IA, disponible 24h/24.

🎮 GAMIFICATION DUOLINGO-STYLE
XP, streak, badges et un Score VITA quotidien pour rester motivé(e) chaque jour.

📊 SUIVI COMPLET
Nutrition · Hydratation · Sommeil · Sport · Score VITA global

---
VERSION GRATUITE (sans achat) :
• 1 photo repas par jour
• 5 messages Coach IA par jour
• Toutes les leçons de base
• Score VITA quotidien

💎 PREMIUM — ACHAT REQUIS (4,99 €/mois ou 35,88 €/an) :
• Photos repas illimitées
• Messages Coach IA illimités
• Streak Freeze (2/semaine)
• Quiz nutrition personnalisés par IA
• Analyse sommeil avancée
• 7 jours d'essai gratuit

L'abonnement Premium se renouvelle automatiquement. Gérable dans les Réglages Apple ID. Annulable à tout moment.

Politique de confidentialité : https://vita-app.co/privacy
Conditions d'utilisation : https://vita-app.co/terms
```

### 4. Renseigner les champs App Store Connect

| Champ | Valeur |
|---|---|
| Privacy Policy URL | `https://vita-app.co/privacy` |
| Terms of Use / EULA | Utiliser l'EULA standard Apple OU ajouter le lien `https://vita-app.co/terms` dans la description |
| Catégorie | Santé et forme |
| Sous-catégorie | Fitness |
| Classification d'âge | 17+ (conseils médicaux/traitement) |

### 5. Notes pour l'équipe App Review

Dans App Store Connect → App Review Information → Notes :

```
Bonjour,

Merci pour votre retour détaillé. Voici les corrections apportées :

1. Sign in with Apple : désormais implémenté avec expo-apple-authentication. 
   Compte de test Apple : reviewer@vita-app.co / VitaReview2026!

2. Affichage des prix : le montant total facturé (35,88€/an ou 4,99€/mois) 
   est maintenant l'élément le plus grand et visible. Le calcul par mois 
   apparaît en texte subordonné plus petit.

3. Achats intégrés : les deux produits (vita_monthly et vita_annual) ont été 
   soumis pour révision. Le Paid Apps Agreement est accepté.

4. EULA et Politique de confidentialité : liens fonctionnels disponibles dans 
   le paywall, dans l'onglet Profil, et sur l'écran d'authentification.

5. Features Premium : toutes clairement labellisées "Achat requis" dans l'UI 
   et dans la description App Store.

Cordialement,
Gwladys Henry
```

### 6. Compte de test pour l'App Review

Créer un compte sandbox Apple et le renseigner dans App Review Information :
- Email : un email de test dédié
- Mot de passe : mot de passe fort
- Ou utiliser Sign in with Apple directement

---

## 🔄 Ordre de resoumission

1. Soumettre les 2 IAP dans App Store Connect ✓
2. Accepter Paid Apps Agreement ✓  
3. Mettre à jour description + Privacy Policy URL ✓
4. Upload nouvelle version du binary (eas build + submit) ✓
5. Remplir les Notes App Review ✓
6. Soumettre ✓

Délai estimé : 24-48h pour la révision.

import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  KeyboardAvoidingView, Platform, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withDelay } from 'react-native-reanimated';
import { Button } from '../../components/ui/Button';
import { Colors, Spacing, Radius } from '../../constants/theme';
import { useUserStore } from '../../lib/store/useUser';

type Mode = 'splash' | 'login' | 'register';

export default function AuthScreen() {
  const [mode, setMode] = useState<Mode>('splash');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);

  const logoScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    logoScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    contentOpacity.value = withDelay(400, withSpring(1));

    AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  // --- Sign in with Apple ---
  const handleAppleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const name = [
        credential.fullName?.givenName,
        credential.fullName?.familyName,
      ].filter(Boolean).join(' ') || 'Utilisateur';

      // Create user profile and go to onboarding
      // (Apple only sends name/email on first sign-in — store it)
      useUserStore.getState().setOnboardingData({
        name,
      });

      // Navigate to onboarding for new users
      router.replace('/(auth)/onboarding');
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        setError('La connexion Apple a échoué. Réessaie.');
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Email/password ---
  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs.');
      return;
    }
    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // Supabase auth (email + password)
      const { supabase } = await import('../../lib/api/supabase');
      if (mode === 'register') {
        const { data, error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        useUserStore.getState().setOnboardingData({ name: email.split('@')[0] });
        router.replace('/(auth)/onboarding');
      } else {
        const { data, error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        // Existing user — check profile
        router.replace('/(tabs)/');
      }
    } catch (e: any) {
      setError(e.message ?? 'Une erreur est survenue. Réessaie.');
    } finally {
      setLoading(false);
    }
  };

  // --- Splash view ---
  if (mode === 'splash') {
    return (
      <View style={styles.container}>
        <View style={styles.hero}>
          <Animated.Text style={[styles.logo, logoStyle]}>🌿</Animated.Text>
          <Animated.View style={[{ alignItems: 'center', gap: 8 }, contentStyle]}>
            <Text style={styles.title}>VITA</Text>
            <Text style={styles.subtitle}>Ton coach santé IA{'\n'}personnalisé</Text>
          </Animated.View>
        </View>

        <Animated.View style={[styles.footer, contentStyle]}>
          {appleAvailable && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
            />
          )}

          <Button
            label="Continuer avec l'email"
            onPress={() => setMode('register')}
            variant="green"
          />

          <TouchableOpacity onPress={() => setMode('login')}>
            <Text style={styles.loginLink}>Déjà un compte ? <Text style={styles.loginLinkBold}>Se connecter</Text></Text>
          </TouchableOpacity>

          <Text style={styles.legal}>
            En continuant, tu acceptes nos{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/terms')}>Conditions d'utilisation</Text>
            {' '}et notre{' '}
            <Text style={styles.legalLink} onPress={() => router.push('/legal/privacy')}>Politique de confidentialité</Text>.
          </Text>
        </Animated.View>
      </View>
    );
  }

  // --- Login / Register form ---
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.formScroll} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backBtn} onPress={() => { setMode('splash'); setError(''); }}>
          <Text style={styles.backText}>← Retour</Text>
        </TouchableOpacity>

        <Text style={styles.formTitle}>
          {mode === 'register' ? 'Créer mon compte' : 'Me connecter'}
        </Text>
        <Text style={styles.formSub}>
          {mode === 'register'
            ? 'Crée ton compte pour commencer ton parcours VITA.'
            : 'Bon retour ! Connecte-toi pour retrouver ton programme.'}
        </Text>

        {appleAvailable && (
          <>
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={12}
              style={styles.appleBtn}
              onPress={handleAppleSignIn}
            />
            <View style={styles.separator}>
              <View style={styles.sepLine} />
              <Text style={styles.sepText}>ou</Text>
              <View style={styles.sepLine} />
            </View>
          </>
        )}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Adresse email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="toi@example.com"
            placeholderTextColor={Colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mot de passe</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="8 caractères minimum"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry
          />
        </View>

        {error !== '' && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}

        <Button
          label={loading ? '' : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
          onPress={handleEmailAuth}
          variant="green"
          loading={loading}
          disabled={loading}
        />

        <TouchableOpacity onPress={() => setMode(mode === 'register' ? 'login' : 'register')}>
          <Text style={styles.switchMode}>
            {mode === 'register'
              ? 'Déjà un compte ? Se connecter →'
              : 'Pas encore de compte ? S\'inscrire →'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.legal}>
          En continuant, tu acceptes nos{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/legal/terms')}>Conditions d'utilisation</Text>
          {' '}et notre{' '}
          <Text style={styles.legalLink} onPress={() => router.push('/legal/privacy')}>Politique de confidentialité</Text>.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    paddingHorizontal: Spacing.xl,
  },
  logo: { fontSize: 80 },
  title: {
    fontSize: 64,
    fontFamily: 'Fraunces-Black',
    color: Colors.textPrimary,
    letterSpacing: -2,
  },
  subtitle: {
    fontSize: 20,
    fontFamily: 'Nunito-Bold',
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 30,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 48,
    gap: Spacing.md,
  },
  appleBtn: { width: '100%', height: 52 },
  formScroll: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 48,
    gap: Spacing.lg,
  },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: Colors.textSecondary, fontFamily: 'Nunito-Bold', fontSize: 15 },
  formTitle: { fontSize: 28, fontFamily: 'Fraunces-Black', color: Colors.textPrimary },
  formSub: { fontSize: 15, fontFamily: 'Nunito-SemiBold', color: Colors.textSecondary, lineHeight: 22 },
  separator: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  sepLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  sepText: { color: Colors.textMuted, fontFamily: 'Nunito-SemiBold', fontSize: 13 },
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
  errorBox: {
    backgroundColor: Colors.red + '20',
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.red + '44',
  },
  errorText: { color: Colors.red, fontFamily: 'Nunito-Bold', fontSize: 14 },
  loginLink: { textAlign: 'center', color: Colors.textMuted, fontFamily: 'Nunito-SemiBold', fontSize: 14 },
  loginLinkBold: { color: Colors.green, fontFamily: 'Nunito-ExtraBold' },
  switchMode: { textAlign: 'center', color: Colors.blue, fontFamily: 'Nunito-Bold', fontSize: 14 },
  legal: {
    fontSize: 11,
    fontFamily: 'Nunito-SemiBold',
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
  legalLink: { color: Colors.textSecondary, textDecorationLine: 'underline' },
});

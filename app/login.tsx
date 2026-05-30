/**
 * Pantalla de acceso: registro e inicio de sesión contra noteflow-api.
 */
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { spacing, typography } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const colors = useNoteFlowColors();
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    clearError();
    setIsSubmitting(true);
    const ok =
      mode === 'login'
        ? await login(email.trim(), password)
        : await register(email.trim(), password);
    setIsSubmitting(false);
    if (ok) router.replace('/notas');
  }

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>NoteFlow</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {mode === 'login'
            ? 'Inicia sesión para ver tus notas'
            : 'Crea tu cuenta para empezar'}
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete={mode === 'login' ? 'password' : 'new-password'}
          mode="outlined"
          style={styles.input}
        />

        {error ? (
          <Text style={[styles.error, { color: colors.textSecondary }]}>{error}</Text>
        ) : null}

        <Button
          mode="contained"
          onPress={() => void handleSubmit()}
          loading={isSubmitting}
          disabled={isSubmitting || email.trim().length === 0 || password.length < 8}
          buttonColor={colors.fill}
          style={styles.button}
        >
          {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </Button>

        <Button
          mode="text"
          onPress={() => {
            clearError();
            setMode((m) => (m === 'login' ? 'register' : 'login'));
          }}
        >
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '800',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: 'transparent',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.sm,
  },
});

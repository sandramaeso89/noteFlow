/**
 * Pantalla de registro: Firebase Auth + documento users/{uid} en Firestore.
 */
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { AuthScreenFrame } from '../components/auth/AuthScreenFrame';
import { FieldError } from '../components/forms/FieldError';
import { spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import { authFieldErrors, registerFormSchema } from '../schemas/authSchemas';
import { useAuthStore } from '../store/authStore';

export default function RegisterScreen() {
  const colors = useNoteFlowColors();
  const register = useAuthStore((s) => s.register);
  const storeError = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    clearError();
    setFieldErrors({});

    const parsed = registerFormSchema.safeParse({ name, email, password });
    if (!parsed.success) {
      setFieldErrors(authFieldErrors(parsed.error));
      return;
    }

    setIsSubmitting(true);
    const ok = await register(parsed.data.email, parsed.data.password, parsed.data.name);
    setIsSubmitting(false);

    if (ok) router.replace('/notas');
  }

  return (
    <AuthScreenFrame
      title="Crear cuenta"
      subtitle="Regístrate para guardar tus notas en la nube"
    >
      <View>
        <TextInput
          label="Nombre"
          value={name}
          onChangeText={setName}
          autoComplete="name"
          mode="outlined"
          style={styles.input}
          error={!!fieldErrors.name}
        />
        <FieldError message={fieldErrors.name} />
      </View>

      <View>
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="email"
          mode="outlined"
          style={styles.input}
          error={!!fieldErrors.email}
        />
        <FieldError message={fieldErrors.email} />
      </View>

      <View>
        <TextInput
          label="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="new-password"
          mode="outlined"
          style={styles.input}
          error={!!fieldErrors.password}
        />
        <FieldError message={fieldErrors.password} />
      </View>

      {storeError ? (
        <Text style={[styles.error, { color: colors.textSecondary }]} accessibilityRole="alert">
          {storeError}
        </Text>
      ) : null}

      <Button
        mode="contained"
        onPress={() => void handleSubmit()}
        loading={isSubmitting}
        disabled={isSubmitting}
        buttonColor={colors.fill}
        style={styles.button}
      >
        Crear cuenta
      </Button>

      <Link href="/login" asChild>
        <Button mode="text" onPress={clearError}>
          ¿Ya tienes cuenta? Entra
        </Button>
      </Link>
    </AuthScreenFrame>
  );
}

const styles = StyleSheet.create({
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

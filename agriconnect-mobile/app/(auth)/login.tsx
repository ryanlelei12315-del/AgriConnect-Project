import React, { useState } from 'react';
import { StyleSheet, Text, View, KeyboardAvoidingView, Platform } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing, typography } from '../../src/theme';
import Screen from '../../src/components/Screen';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { validateLogin } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

export default function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setServerError('');
    const v = validateLogin({ identifier, password });
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      await login(identifier.trim(), password);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Unable to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen keyboard>
      <View style={styles.brand}>
        <Text style={styles.logo}>🌾</Text>
        <Text style={styles.title}>AgriConnect</Text>
        <Text style={styles.tagline}>Farm direct. No brokers.</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.formTitle}>Welcome back</Text>
        <Input
          label="Email or phone number"
          placeholder="e.g. john@example.com or 0712345678"
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
          error={errors.identifier}
        />
        <Input
          label="Password"
          placeholder="Your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />
        {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
        <Button title="Sign In" onPress={onSubmit} loading={loading} />
        <View style={styles.footer}>
          <Text style={typography.body}>New to AgriConnect? </Text>
          <Link href="/register" style={styles.link}>
            Create an account
          </Link>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
  logo: { fontSize: 56, marginBottom: 8 },
  title: { ...typography.title, fontSize: 30 },
  tagline: { color: colors.inkSoft, marginTop: 4 },
  form: { flex: 1 },
  formTitle: { ...typography.h1, marginBottom: spacing.lg },
  serverError: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { color: colors.emerald, fontWeight: '700' },
});

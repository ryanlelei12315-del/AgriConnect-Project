import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing, typography } from '../../src/theme';
import Screen from '../../src/components/Screen';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import ChoiceChips from '../../src/components/ChoiceChips';
import { ROLES, ROLE_LABELS, COUNTIES } from '../../src/constants';
import { validateRegister } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', password: '', confirmPassword: '', role: '', county: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setServerError('');
    const v = validateRegister(form);
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      await register({
        full_name: form.fullName.trim(),
        email: form.email.trim() || undefined,
        phone_number: form.phoneNumber.trim() || undefined,
        password: form.password,
        role: form.role,
        county: form.county || undefined,
      });
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Unable to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen keyboard>
      <Text style={styles.title}>Create your account</Text>
      <Text style={styles.sub}>Join free and start trading directly.</Text>

      <Text style={labels}>I am a…</Text>
      <ChoiceChips
        options={ROLES as unknown as readonly string[]}
        value={form.role}
        onChange={set('role')}
      />
      {errors.role ? <Text style={styles.err}>{errors.role}</Text> : null}

      <Input label="Full name" placeholder="e.g. John Mwangi" value={form.fullName} onChangeText={set('fullName')} error={errors.fullName} />
      <Text style={labels}>Email or phone (provide at least one)</Text>
      <Input label="Email" placeholder="you@example.com" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <Input label="Phone number" placeholder="e.g. 0712345678" value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" error={errors.phoneNumber} />

      <Text style={labels}>County</Text>
      <ChoiceChips options={COUNTIES as unknown as readonly string[]} value={form.county} onChange={set('county')} />
      {errors.county ? <Text style={styles.err}>{errors.county}</Text> : null}

      <Input label="Password" placeholder="At least 8 characters" value={form.password} onChangeText={set('password')} secureTextEntry error={errors.password} />
      <Input label="Confirm password" placeholder="Repeat password" value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry error={errors.confirmPassword} />

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
      <Button title="Create Account" onPress={onSubmit} loading={loading} />

      <View style={styles.footer}>
        <Text style={typography.body}>Already have an account? </Text>
        <Link href="/login" style={styles.link}>
          Sign in
        </Link>
      </View>
      <Text style={styles.hint}>
        {ROLE_LABELS.farmer} = grow &amp; sell · {ROLE_LABELS.buyer} = buy produce · {ROLE_LABELS.provider} = offer farm services
      </Text>
    </Screen>
  );
}

const labels = { fontSize: 13, fontWeight: '600' as const, color: colors.inkMid, marginBottom: 6, marginTop: 4 };
const styles = StyleSheet.create({
  title: { ...typography.title, marginBottom: 4 },
  sub: { color: colors.inkSoft, marginBottom: spacing.lg },
  err: { color: colors.danger, fontSize: 12.5, marginBottom: 8 },
  serverError: { color: colors.danger, marginBottom: spacing.sm, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
  link: { color: colors.emerald, fontWeight: '700' },
  hint: { ...typography.small, marginTop: spacing.md, textAlign: 'center' },
});

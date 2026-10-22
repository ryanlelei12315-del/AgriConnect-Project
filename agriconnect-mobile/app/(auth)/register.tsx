import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Link, useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing, typography, radius } from '../../src/theme';
import Screen from '../../src/components/Screen';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import ChoiceChips from '../../src/components/ChoiceChips';
import { ROLES, ROLE_LABELS, COUNTIES } from '../../src/constants';
import { validateRegister } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

export default function RegisterScreen() {
  const register = useAuthStore((s) => s.register);
  const router = useRouter();
  const params = useLocalSearchParams<{ phone?: string }>();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: params.phone || '',
    password: '',
    confirmPassword: '',
    role: '',
    county: '',
    verifyPhone: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  // Check if phone was already verified (via WhatsApp flow redirect)
  const phoneVerified =
    typeof window !== 'undefined' && window.sessionStorage
      ? window.sessionStorage.getItem('phone_verified') === params.phone
      : false;

  useEffect(() => {
    if (phoneVerified) {
      const el = window.sessionStorage;
      el.removeItem('phone_verified');
      setForm((f) => ({ ...f, verifyPhone: false }));
    }
  }, [phoneVerified]);

  const set = (k: keyof typeof form) => (v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onSubmit = async () => {
    setServerError('');
    const v = validateRegister({
      fullName: form.fullName,
      email: form.email,
      phoneNumber: form.phoneNumber,
      password: form.password,
      confirmPassword: form.confirmPassword,
      role: form.role,
      county: form.county,
    });
    setErrors(v);
    if (Object.keys(v).length) return;

    // Phone verification gate
    if (form.verifyPhone && form.phoneNumber.trim() && !phoneVerified) {
      router.push({ pathname: '/phone-verify', params: { mode: 'register' } });
      return;
    }

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
        onChange={set('role') as (v: string) => void}
      />
      {errors.role ? <Text style={styles.err}>{errors.role}</Text> : null}

      <Input label="Full name" placeholder="e.g. John Mwangi" value={form.fullName} onChangeText={set('fullName') as (v: string) => void} error={errors.fullName} />
      <Text style={labels}>Email or phone (provide at least one)</Text>
      <Input label="Email" placeholder="you@example.com" value={form.email} onChangeText={set('email') as (v: string) => void} autoCapitalize="none" keyboardType="email-address" error={errors.email} />
      <Input
        label="Phone number"
        placeholder="e.g. 0712345678"
        value={form.phoneNumber}
        onChangeText={set('phoneNumber') as (v: string) => void}
        keyboardType="phone-pad"
        error={errors.phoneNumber}
      />

      <View style={styles.verifyRow}>
        <Link
          href="/phone-verify?mode=register"
          style={styles.verifyLink}
        >
          Verify via WhatsApp OTP
        </Link>
      </View>

      <Text style={labels}>County</Text>
      <ChoiceChips options={COUNTIES as unknown as readonly string[]} value={form.county} onChange={set('county') as (v: string) => void} />
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

      <View style={styles.whatsappContainer}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or register with</Text>
        <View style={styles.divider} />
      </View>

      <Link href="/phone-verify?mode=register" style={styles.whatsappBtn}>
        <Text style={styles.whatsappText}>WhatsApp OTP</Text>
      </Link>

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
  verifyRow: { marginVertical: spacing.sm },
  verifyLink: { color: colors.emerald, fontWeight: '700', fontSize: 14 },
  whatsappContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    gap: 10,
  },
  divider: { flex: 1, height: 1, backgroundColor: colors.stone },
  dividerText: { color: colors.inkSoft, fontSize: 13, paddingHorizontal: 4 },
  whatsappBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: '#22c55e',
    backgroundColor: '#dcfce7',
    marginTop: spacing.sm,
  },
  whatsappText: {
    color: '#16a34a',
    fontWeight: '700',
    fontSize: 16,
  },
});

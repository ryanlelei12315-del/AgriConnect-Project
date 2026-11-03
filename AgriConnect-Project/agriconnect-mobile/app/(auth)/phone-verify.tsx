import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform, TextInput } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuthStore } from '../../src/store/authStore';
import * as authApi from '../../src/api/auth';
import { colors, spacing, typography, radius } from '../../src/theme';
import Screen from '../../src/components/Screen';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { validatePhoneInput, validateOtp } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

/**
 * WhatsApp phone verification flow shared by login and register.
 * - mode=register → verify phone ownership, then bounce back to /register (phone pre-filled)
 * - mode=login    → verify phone ownership, then perform passwordless WhatsApp login
 */
export default function PhoneVerifyScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string; phone?: string }>();
  const mode = params.mode === 'login' ? 'login' : 'register';
  const whatsappLogin = useAuthStore((s) => s.whatsappLogin);

  const [phone, setPhone] = useState(params.phone || '');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [devOtp, setDevOtp] = useState<string | null>(null); // dev only

  // Auto-advance to OTP step if phone came in via params
  useEffect(() => {
    if (params.phone) {
      const v = validatePhoneInput(params.phone);
      if (v.length === 0) setStep('otp');
    }
  }, [params.phone]);

  const sendOtp = async () => {
    setErrors({});
    const v = validatePhoneInput(phone);
    if (v.length) {
      setErrors({ phone: v[0] });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.sendPhoneVerification(phone.trim(), mode);
      if (res.code) setDevOtp(res.code);
      setStep('otp');
      if (__DEV__ && res.code) {
        Alert.alert('Dev OTP', `Code: ${res.code}`, [{ text: 'OK' }]);
      }
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  const confirmOtp = async () => {
    setErrors({});
    const v = validateOtp(otp);
    if (v.length) {
      setErrors({ otp: v[0] });
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') {
        await whatsappLogin(phone.trim(), otp);
        router.replace('/');
      } else {
        await authApi.verifyPhoneOTP(phone.trim(), mode, otp);
        if (typeof window !== 'undefined' && window.sessionStorage) {
          window.sessionStorage.setItem('phone_verified', phone.trim());
        }
        router.push({ pathname: '/register', params: { phone: phone.trim() } });
      }
    } catch (err) {
      Alert.alert('Error', err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (step === 'otp') setStep('phone');
    else router.back();
  };

  return (
    <Screen keyboard>
      <View style={styles.brand}>
        <Text style={styles.logo}>📱</Text>
        <Text style={styles.title}>WhatsApp Verification</Text>
        <Text style={styles.tagline}>
          {mode === 'login' ? 'Sign in with your phone' : 'Verify your phone before registering'}
        </Text>
      </View>

      <View style={styles.form}>
        {step === 'phone' ? (
          <>
            <Input
              label="Phone number"
              placeholder="e.g. 0712345678"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              error={errors.phone}
            />
            <Button title="Send 6-digit code" onPress={sendOtp} loading={loading} />
          </>
        ) : (
          <>
            <Text style={styles.stepHint}>Enter the code sent to {phone}</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 4, marginBottom: spacing.md }}>
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <TextInput
                  key={i}
                  style={[
                    styles.otpInput,
                    {
                      borderColor: errors.otp ? colors.danger : colors.stone,
                      backgroundColor: colors.white,
                    },
                  ]}
                  value={otp[i] || ''}
                  onChangeText={(t) => {
                    const newOtp = otp.split('');
                    newOtp[i] = t[0] || '';
                    setOtp(newOtp.join(''));
                  }}
                  keyboardType={Platform.select({ ios: 'number-pad', android: 'number' }) as never}
                  maxLength={1}
                  autoFocus={i === 0}
                />
              ))}
            </View>
            {errors.otp ? <Text style={styles.err}>{errors.otp}</Text> : null}
            <Button title={mode === 'login' ? 'Sign In' : 'Verify'} onPress={confirmOtp} loading={loading} />
          </>
        )}

        {devOtp ? <Text style={styles.devHint}>Dev code: {devOtp}</Text> : null}

        <TouchableOpacity onPress={goBack} style={styles.backLink}>
          <Text style={styles.link}>{step === 'otp' ? '← Change phone number' : '← Back'}</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
  logo: { fontSize: 48, marginBottom: 8 },
  title: { ...typography.title, fontSize: 26 },
  tagline: { color: colors.inkSoft, marginTop: 4, textAlign: 'center' },
  form: { flex: 1 },
  stepHint: { ...typography.body, color: colors.inkMid, marginBottom: spacing.md, textAlign: 'center' },
  otpInput: {
    flex: 1,
    minHeight: 56,
    borderWidth: 1.5,
    borderRadius: radius.md,
    fontSize: 20,
    textAlign: 'center',
    color: colors.ink,
  },
  devHint: { color: colors.inkSoft, fontSize: 12, textAlign: 'center', marginTop: spacing.sm, fontStyle: 'italic' },
  backLink: { marginTop: spacing.md, alignItems: 'center' },
  err: { color: colors.danger, fontSize: 12.5, marginBottom: 8, textAlign: 'center' },
  link: { color: colors.emerald, fontWeight: '700' },
});
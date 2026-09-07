import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { useUpdatePassword } from '../../src/features/useProfile';
import { ApiError } from '../../src/api/client';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const updatePassword = useUpdatePassword();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.currentPassword) e.currentPassword = 'Current password is required.';
    if (form.newPassword.length < 8) e.newPassword = 'New password must be 8-72 characters.';
    if (form.confirmPassword !== form.newPassword) e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const onSubmit = async () => {
    const v = validate();
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      setServerError('');
      await updatePassword.mutateAsync({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      Alert.alert('Success', 'Your password has been changed.');
      router.back();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to change password.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Input label="Current password" placeholder="Your current password" value={form.currentPassword} onChangeText={set('currentPassword')} secureTextEntry error={errors.currentPassword} />
      <Input label="New password" placeholder="At least 8 characters" value={form.newPassword} onChangeText={set('newPassword')} secureTextEntry error={errors.newPassword} />
      <Input label="Confirm new password" placeholder="Repeat new password" value={form.confirmPassword} onChangeText={set('confirmPassword')} secureTextEntry error={errors.confirmPassword} />
      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
      <Button title={loading ? 'Saving…' : 'Change Password'} onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40, backgroundColor: '#fdfbf7' },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
});

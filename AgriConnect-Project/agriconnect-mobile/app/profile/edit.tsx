import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing } from '../../src/theme';
import { COUNTIES, ROLE_LABELS } from '../../src/constants';
import { useProfile, useUpdateProfile } from '../../src/features/useProfile';
import ChoiceChips from '../../src/components/ChoiceChips';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { LoadingState, ErrorState } from '../../src/components/States';
import { ApiError } from '../../src/api/client';

export default function EditProfileScreen() {
  const router = useRouter();
  const { data: profile, isPending, isError, refetch } = useProfile();
  const updateProfile = useUpdateProfile();
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', county: '', bio: '' });
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  React.useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName || profile.full_name || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || profile.phone_number || '',
        county: profile.county || '',
        bio: profile.bio || '',
      });
    }
  }, [profile]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const onSave = async () => {
    if (!form.fullName.trim()) {
      setServerError('Full name is required.');
      return;
    }
    try {
      setLoading(true);
      setServerError('');
      await updateProfile.mutateAsync({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phoneNumber: form.phoneNumber.trim(),
        county: form.county || '',
        bio: form.bio ? form.bio.trim() : "",
      });
      Alert.alert('Saved', 'Your profile has been updated.');
      router.back();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to update profile.');
    } finally { setLoading(false); }
  };

  if (isPending) return <LoadingState label="Loading profile…" />;
  if (isError) return <ErrorState message="Could not load profile." onRetry={() => refetch()} />;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Input label="Full name" value={form.fullName} onChangeText={set('fullName')} />
      <Input label="Email" value={form.email} onChangeText={set('email')} autoCapitalize="none" keyboardType="email-address" />
      <Input label="Phone number" value={form.phoneNumber} onChangeText={set('phoneNumber')} keyboardType="phone-pad" />
      <Text style={styles.label}>County</Text>
      <ChoiceChips options={COUNTIES as readonly string[]} value={form.county} onChange={set('county')} />
      <Input label="Bio" value={form.bio} onChangeText={set('bio')} style={{ height: 80 }} />
      {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
      <Button title={loading ? 'Saving…' : 'Save Changes'} onPress={onSave} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40, backgroundColor: '#fdfbf7' },
  label: { fontSize: 13, fontWeight: '600', color: '#38423a', marginBottom: 6, marginTop: 4 },
  error: { color: '#c0392b', fontSize: 13, marginBottom: 12, textAlign: 'center' },
});

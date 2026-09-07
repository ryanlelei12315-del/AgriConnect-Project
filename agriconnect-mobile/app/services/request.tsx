import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { SERVICE_CATEGORIES } from '../../src/constants';
import { requestService } from '../../src/api/services';
import { useQueryClient } from '@tanstack/react-query';
import ChoiceChips from '../../src/components/ChoiceChips';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { validateServiceRequest } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

export default function RequestServiceScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({ location: '', requestedDate: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const setTomorrow = () => {
    const d = new Date(Date.now() + 86400000);
    setForm((f) => ({ ...f, requestedDate: d.toISOString().slice(0, 10) }));
  };

  const onSubmit = async () => {
    setServerError('');
    const v = validateServiceRequest({ location: form.location, requestedDate: form.requestedDate });
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      await requestService(Number(serviceId), {
        location: form.location.trim(),
        requested_date: form.requestedDate,
        description: form.description.trim() || undefined,
      });
      qc.invalidateQueries({ queryKey: ['service-requests'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
      Alert.alert('Request sent', 'Your service request has been sent to the provider.');
      router.back();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to send request.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={typography.h2}>Request Service</Text>
      <Text style={styles.sub}>Service ID: {serviceId}</Text>
      <Input label="Location" placeholder="e.g. Kiambu, near market" value={form.location} onChangeText={set('location')} error={errors.location} />
      <View style={styles.dateRow}>
        <Input
          label="Requested date (YYYY-MM-DD)"
          placeholder="e.g. 2024-06-15"
          value={form.requestedDate}
          onChangeText={set('requestedDate')}
          error={errors.requestedDate}
          style={{ flex: 1, marginBottom: 0 }}
        />
        <Button title="Tomorrow" onPress={setTomorrow} variant="outline" fullWidth={false} style={styles.tomorrowBtn} />
      </View>
      <Input
        label="Details (optional)"
        placeholder="Describe what you need…"
        value={form.description}
        onChangeText={set('description')}
        style={{ height: 80 }}
      />
      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
      <Button title={loading ? 'Sending…' : 'Send Request'} onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40, backgroundColor: colors.cream },
  sub: { ...typography.small, color: colors.inkSoft, marginBottom: spacing.lg },
  dateRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  tomorrowBtn: { height: 44, paddingHorizontal: 12 },
  serverError: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography } from '../../src/theme';
import { PRODUCE_CATEGORIES, COUNTIES, LISTING_STATUS } from '../../src/constants';
import { getListing } from '../../src/api/listings';
import { updateProduce, deleteProduce } from '../../src/api/produce';
import { uploadListingImage } from '../../src/api/listings';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChoiceChips from '../../src/components/ChoiceChips';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { validateProduce } from '../../src/utils/validation';
import { LoadingState, ErrorState } from '../../src/components/States';
import { ApiError } from '../../src/api/client';

export default function EditProduceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const listingId = id ? Number(id) : 0;
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', category: '', quantity: '', price: '', county: '', description: '', status: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data: listing, isPending, isError, refetch } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => getListing(listingId),
    enabled: !!listingId,
  });

  React.useEffect(() => {
    if (listing) {
      setForm({
        name: listing.name || '',
        category: listing.category || '',
        quantity: String(listing.quantityKg || ''),
        price: String(listing.pricePerKgKes || ''),
        county: listing.county || '',
        description: listing.description || '',
        status: listing.status || 'LISTED',
      });
    }
  }, [listing]);

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'AgriConnect needs access to your photos.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const onSave = async () => {
    setServerError('');
    const v = validateProduce({ name: form.name, category: form.category, quantity: form.quantity, price: form.price, county: form.county });
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      await updateProduce(listingId, {
        name: form.name.trim(),
        category: form.category,
        quantity: form.quantity,
        price: form.price,
        location: form.county,
        description: form.description.trim(),
        status: form.status,
      });
      if (imageUri) {
        await uploadListingImage(listingId, imageUri);
      }
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['my-produce'] });
      qc.invalidateQueries({ queryKey: ['listing', listingId] });
      Alert.alert('Saved', 'Your listing has been updated.');
      router.back();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to update listing.');
    } finally { setLoading(false); }
  };

  const onDelete = () => {
    Alert.alert('Delete listing', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteProduce(listingId);
          qc.invalidateQueries({ queryKey: ['listings'] });
          qc.invalidateQueries({ queryKey: ['my-produce'] });
          router.back();
        } catch (err) {
          Alert.alert('Error', (err as Error).message || 'Failed to delete.');
        }
      } },
    ]);
  };

  if (!listingId) return <LoadingState label="Invalid listing…" />;
  if (isPending) return <LoadingState label="Loading listing…" />;
  if (isError) return <ErrorState message="Could not load listing." onRetry={() => refetch()} />;
  if (!listing) return <ErrorState message="Listing not found." />;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={typography.label}>Category</Text>
      <ChoiceChips options={PRODUCE_CATEGORIES as readonly string[]} value={form.category} onChange={set('category')} />
      <Input label="Produce name" value={form.name} onChangeText={set('name')} error={errors.name} />
      <Input label="Quantity (kg)" value={form.quantity} onChangeText={set('quantity')} keyboardType="numeric" error={errors.quantity} />
      <Input label="Price per kg (KES)" value={form.price} onChangeText={set('price')} keyboardType="numeric" error={errors.price} />
      <Text style={typography.label}>County</Text>
      <ChoiceChips options={COUNTIES as readonly string[]} value={form.county} onChange={set('county')} />
      <Input label="Description" value={form.description} onChangeText={set('description')} style={{ height: 80 }} />
      <Text style={typography.label}>Status</Text>
      <ChoiceChips options={Object.keys(LISTING_STATUS) as readonly string[]} value={form.status} onChange={set('status')} />
      <Button title={imageUri ? 'Change Photo' : 'Change Photo'} onPress={pickImage} variant="outline" />
      {imageUri ? <Text style={styles.photoSet}>New photo selected</Text> : null}
      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
      <Button title={loading ? 'Saving…' : 'Save Changes'} onPress={onSave} loading={loading} />
      <Button title="Delete Listing" onPress={onDelete} variant="danger" style={styles.deleteBtn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40, backgroundColor: colors.cream },
  err: { color: colors.danger, fontSize: 12.5, marginBottom: 4 },
  serverError: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  photoSet: { color: colors.success, fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
  deleteBtn: { marginTop: spacing.md },
});

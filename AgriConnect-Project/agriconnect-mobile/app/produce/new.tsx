import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, radius, typography } from '../../src/theme';
import { PRODUCE_CATEGORIES, COUNTIES } from '../../src/constants';
import { createListing, uploadListingImage } from '../../src/api/listings';
import { useQueryClient } from '@tanstack/react-query';
import ChoiceChips from '../../src/components/ChoiceChips';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { validateProduce } from '../../src/utils/validation';
import { ApiError } from '../../src/api/client';

export default function NewProduceScreen() {
  const router = useRouter();
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: '', category: '', quantity: '', price: '', county: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert('Permission needed', 'AgriConnect needs access to your photos.');
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) setImageUri(result.assets[0].uri);
  };

  const onSubmit = async () => {
    setServerError('');
    const v = validateProduce({ name: form.name, category: form.category, quantity: form.quantity, price: form.price, county: form.county });
    setErrors(v);
    if (Object.keys(v).length) return;
    try {
      setLoading(true);
      const listing = await createListing({
        name: form.name.trim(),
        category: form.category,
        quantity_kg: form.quantity,
        price_per_kg_kes: form.price,
        county: form.county,
        description: form.description.trim() || undefined,
      });
      if (imageUri) {
        await uploadListingImage(listing.id, imageUri);
      }
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['my-produce'] });
      Alert.alert('Success', 'Your produce listing has been created.');
      router.back();
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to create listing.');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Text style={typography.label}>Category</Text>
      <ChoiceChips
        options={PRODUCE_CATEGORIES as readonly string[]}
        value={form.category}
        onChange={set('category')}
      />
      {errors.category ? <Text style={styles.err}>{errors.category}</Text> : null}

      <Input label="Produce name" placeholder="e.g. Cherry Tomatoes" value={form.name} onChangeText={set('name')} error={errors.name} />
      <Input label="Quantity (kg)" placeholder="e.g. 120" value={form.quantity} onChangeText={set('quantity')} keyboardType="numeric" error={errors.quantity} />
      <Input label="Price per kg (KES)" placeholder="e.g. 90" value={form.price} onChangeText={set('price')} keyboardType="numeric" error={errors.price} />

      <Text style={typography.label}>County</Text>
      <ChoiceChips
        options={COUNTIES as readonly string[]}
        value={form.county}
        onChange={set('county')}
      />
      {errors.county ? <Text style={styles.err}>{errors.county}</Text> : null}

      <Input
        label="Description (optional)"
        placeholder="Growing method, harvest date, etc."
        value={form.description}
        onChangeText={set('description')}
        style={{ height: 80 }}
      />

      <Button title={imageUri ? 'Change Photo' : 'Add Photo'} onPress={pickImage} variant="outline" />
      {imageUri ? <Text style={styles.photoSet}>Photo selected</Text> : null}

      {serverError ? <Text style={styles.serverError}>{serverError}</Text> : null}
      <Button title={loading ? 'Saving…' : 'Save Listing'} onPress={onSubmit} loading={loading} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40, backgroundColor: colors.cream },
  err: { color: colors.danger, fontSize: 12.5, marginBottom: 4, marginTop: -4 },
  serverError: { color: colors.danger, marginBottom: spacing.md, textAlign: 'center' },
  photoSet: { color: colors.success, fontSize: 13, marginBottom: spacing.md, textAlign: 'center' },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { getListing } from '../../src/api/listings';
import { createOrder } from '../../src/api/orders';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { StatusPillAuto } from '../../src/components/StatusPill';
import Button from '../../src/components/Button';
import { LoadingState, ErrorState } from '../../src/components/States';
import { formatKes, initials } from '../../src/utils/format';
import { ApiError } from '../../src/api/client';
import { useAuthUser } from '../../src/features/useAuth';

export default function ProduceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const listingId = id ? Number(id) : 0;
  const [buyQty, setBuyQty] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);
  const [serverError, setServerError] = useState('');
  const qc = useQueryClient();
  const currentUser = useAuthUser();

  const { data: listing, isPending, isError, refetch } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => getListing(listingId),
    enabled: !!listingId,
  });

  const handleBuy = async () => {
    const qty = Number(buyQty);
    if (!qty || qty <= 0) {
      setServerError('Please enter a valid quantity.');
      return;
    }
    const available = Number(listing?.quantityKg || 0);
    if (qty > available) {
      setServerError('Only ' + available + ' kg available.');
      return;
    }
    try {
      setIsPlacing(true);
      setServerError('');
      await createOrder(listingId, buyQty);
      qc.invalidateQueries({ queryKey: ['listings'] });
      qc.invalidateQueries({ queryKey: ['orders'] });
      Alert.alert('Order placed!', 'Your order has been placed. Track it in the Orders tab.', [
        { text: 'OK', onPress: () => router.push('/orders') }, // will refetch orders
      ]);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'Failed to place order.');
    } finally {
      setIsPlacing(false);
    }
  };

  if (!listingId) return <LoadingState label="Invalid listing…" />;
  if (isPending) return <LoadingState label="Loading produce…" />;
  if (isError) return <ErrorState message="Could not load this listing." onRetry={() => refetch()} />;
  if (!listing) return <ErrorState message="Listing not found." />;

  const imageUrl = listing.imageUrl || (listing as any).image_url;
  const resolvedImage = imageUrl
    ? (imageUrl.startsWith('http') ? imageUrl : 'http://10.0.2.2:3000' + imageUrl)
    : null;
  const available = Number(listing.quantityKg || 0);
  const pricePer = Number(listing.pricePerKgKes || 0);
  const total = pricePer * Number(buyQty || 0);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {resolvedImage ? (
        <Image source={{ uri: resolvedImage }} style={styles.image} />
      ) : (
        <View style={[styles.image, styles.imgPlaceholder]}>
          <Text style={styles.imgPlaceholderText}>{listing.name?.split(' ')[0]?.charAt(0) || '🌱'}</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={styles.name}>{listing.name}</Text>
          <StatusPillAuto status={listing.status || 'LISTED'} />
        </View>
        <Text style={styles.category}>{listing.category} · {listing.county}</Text>
        {listing.farmer ? (
          <View style={styles.farmerRow}>
            <View style={styles.farmerCircle}>
              <Text style={styles.farmerInit}>{initials(listing.farmer.fullName || listing.farmer.full_name)}</Text>
            </View>
            <Text style={styles.farmerName}>
              {listing.farmer.fullName || listing.farmer.full_name || 'Unknown'}
            </Text>
            {listing.farmer.county ? <Text style={styles.farmerCounty}> · {listing.farmer.county}</Text> : null}
          </View>
        ) : null}
        {listing.description ? <Text style={styles.desc}>{listing.description}</Text> : null}
      </View>

      <View style={styles.priceCard}>
        <Text style={styles.priceLabel}>Price per kg</Text>
        <Text style={styles.priceValue}>{formatKes(pricePer)}</Text>
        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Available</Text>
          <Text style={styles.qtyValue}>{available} kg</Text>
        </View>
        {Number(buyQty) > 0 ? (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total ({buyQty} kg)</Text>
            <Text style={styles.totalValue}>{formatKes(total)}</Text>
          </View>
        ) : null}
      </View>

      {currentUser?.role === 'buyer' && listing.status === 'LISTED' ? (
        <View style={styles.buySection}>
          <TextInput
            style={styles.qtyInput}
            placeholder="Enter quantity (kg)"
            value={buyQty}
            onChangeText={setBuyQty}
            keyboardType="numeric"
            placeholderTextColor={colors.inkSoft}
          />
          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
          <Button title={isPlacing ? 'Placing…' : 'Buy Now'} onPress={handleBuy} loading={isPlacing} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.cream },
  image: { width: '100%', height: 240 },
  imgPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.linen },
  imgPlaceholderText: { fontSize: 56 },
  info: { padding: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { ...typography.h1, fontSize: 24, flex: 1 },
  category: { ...typography.small, color: colors.inkSoft, marginBottom: spacing.sm },
  farmerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.sm },
  farmerCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center' },
  farmerInit: { color: colors.white, fontSize: 13, fontWeight: '700' },
  farmerName: { ...typography.body, fontWeight: '600' },
  farmerCounty: { ...typography.small, color: colors.inkSoft },
  desc: { ...typography.body, color: colors.inkMid, marginTop: spacing.xs },
  priceCard: {
    backgroundColor: colors.white, marginHorizontal: 16, borderRadius: radius.lg,
    padding: spacing.md, ...shadows.card,
  },
  priceLabel: { ...typography.small, color: colors.inkSoft, textTransform: 'uppercase' },
  priceValue: { ...typography.h1, color: colors.emeraldDark, marginTop: 4 },
  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  qtyLabel: { ...typography.small, color: colors.inkSoft },
  qtyValue: { ...typography.body, fontWeight: '600' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.stone, paddingTop: spacing.sm },
  totalLabel: { ...typography.h2 },
  totalValue: { ...typography.h2, color: colors.emeraldDark },
  buySection: { padding: 16, borderTopWidth: 1, borderTopColor: colors.stone },
  qtyInput: {
    minHeight: 50, borderWidth: 1, borderColor: colors.stone,
    borderRadius: radius.md, paddingHorizontal: spacing.md, fontSize: 16,
    color: colors.ink, backgroundColor: colors.white, marginBottom: spacing.sm,
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { useAuthUser } from '../../src/features/useAuth';
import { useOrder, useUpdateOrderStatus, useCreateReview } from '../../src/features/useOrders';
import { StatusPillAuto } from '../../src/components/StatusPill';
import Button from '../../src/components/Button';
import { LoadingState, ErrorState } from '../../src/components/States';
import { formatKes, formatDate, initials } from '../../src/utils/format';
import { ORDER_STATUS } from '../../src/constants';

const ORDER_STEPS = ['pending', 'confirmed', 'shipped', 'completed'];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orderId = id ? Number(id) : 0;
  const currentUser = useAuthUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const { data: order, isPending, isError, refetch } = useOrder(orderId);
  const updateStatus = useUpdateOrderStatus();
  const createReview = useCreateReview();

  const handleAdvanceStatus = (newStatus: string) => {
    updateStatus.mutate({ id: orderId, status: newStatus });
  };

  const handleReview = async () => {
    if (!order) return;
    try {
      setIsSubmitting(true);
      setServerError('');
      await createReview.mutateAsync({ orderId: order.id, rating, comment });
      Alert.alert('Review submitted', 'Thank you for your feedback!');
    } catch (err) {
      setServerError((err as Error)?.message || 'Failed to submit review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!orderId) return <LoadingState label="Invalid order…" />;
  if (isPending) return <LoadingState label="Loading order…" />;
  if (isError) return <ErrorState message="Could not load order." onRetry={() => refetch()} />;
  if (!order) return <ErrorState message="Order not found." />;

  const isBuyer = order.userId === currentUser?.id;
  const isSeller = order.sellerId === currentUser?.id;
  const currentStep = ORDER_STEPS.indexOf(order.status || 'pending');
  const canAdvance = isSeller && order.status !== 'completed' && order.status !== 'canceled';
  const canReview = isBuyer && order.status === 'completed';

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.orderNum}>Order #ORD-{order.id}</Text>
          <StatusPillAuto status={order.status || 'pending'} />
        </View>
        <Text style={styles.total}>{formatKes(order.totalKes)}</Text>
        <Text style={styles.date}>{formatDate(order.createdAt)}</Text>
      </View>

      <Text style={styles.section}>Items</Text>
      <View style={styles.card}>
        {(order.items || []).map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.listing?.name || 'Unknown produce'}</Text>
            <View style={styles.itemDetails}>
              <Text style={styles.itemQty}>{item.quantityKg} kg × {formatKes(item.unitPriceKes)} = {formatKes(item.totalKes)}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Status timeline</Text>
      <View style={styles.card}>
        {ORDER_STEPS.map((step, idx) => {
          const reached = idx <= currentStep;
          return (
            <View key={step} style={styles.stepRow}>
              <View style={[styles.stepDot, reached && styles.stepDotActive]}>
                {reached ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[styles.stepLabel, reached && styles.stepLabelActive]}>
                  {ORDER_STATUS[step] || step}
                </Text>
                <Text style={styles.stepDate}>{idx === 0 ? formatDate(order.createdAt) : '—'}</Text>
              </View>
            </View>
          );
        })}
      </View>

      {canAdvance ? (
        <View style={styles.card}>
          <Text style={styles.section}>Update status</Text>
          <View style={styles.actions}>
            {order.status === 'pending' && (
              <Button title="Confirm Order" onPress={() => handleAdvanceStatus('confirmed')} variant="secondary" />
            )}
            {order.status === 'confirmed' && (
              <Button title="Mark as Shipped" onPress={() => handleAdvanceStatus('shipped')} variant="secondary" />
            )}
            {order.status === 'shipped' && (
              <Button title="Mark as Completed" onPress={() => handleAdvanceStatus('completed')} variant="secondary" />
            )}
          </View>
        </View>
      ) : null}

      {canReview ? (
        <View style={styles.card}>
          <Text style={styles.section}>Write a review</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable key={n} onPress={() => setRating(n)}>
                <Ionicons name={n <= rating ? 'star' : 'star-outline'} size={28} color={n <= rating ? colors.gold : colors.inkSoft} />
              </Pressable>
            ))}
          </View>
          <TextInput
            style={styles.commentInput}
            placeholder="What did you think of this produce?"
            value={comment}
            onChangeText={setComment}
            multiline
            placeholderTextColor={colors.inkSoft}
          />
          {serverError ? <Text style={styles.error}>{serverError}</Text> : null}
          <Button title={isSubmitting ? 'Submitting…' : 'Submit Review'} onPress={handleReview} loading={isSubmitting} />
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.cream, padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg, ...shadows.card,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderNum: { ...typography.label, color: colors.emerald },
  total: { ...typography.h1, color: colors.emeraldDark, marginBottom: 2 },
  date: { ...typography.small, color: colors.inkSoft },
  section: { ...typography.h2, marginHorizontal: 0, marginBottom: spacing.sm, color: colors.ink },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.stone },
  itemName: { ...typography.body },
  itemDetails: { alignItems: 'flex-end' },
  itemQty: { ...typography.small, color: colors.inkMid },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 8 },
  stepDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: colors.stone, alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  stepInfo: { flex: 1 },
  stepLabel: { ...typography.body, color: colors.inkSoft },
  stepLabelActive: { color: colors.ink, fontWeight: '600' },
  stepDate: { ...typography.small, color: colors.inkSoft },
  actions: { gap: spacing.sm },
  ratingRow: { flexDirection: 'row', gap: 4, marginBottom: spacing.md },
  commentInput: {
    minHeight: 80, borderWidth: 1, borderColor: colors.stone,
    borderRadius: radius.md, padding: spacing.md, fontSize: 15,
    color: colors.ink, backgroundColor: colors.white, marginBottom: spacing.md, textAlignVertical: 'top',
  },
  error: { color: colors.danger, fontSize: 13, marginBottom: spacing.sm, textAlign: 'center' },
});

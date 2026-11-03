import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatKes, formatDate } from '../utils/format';
import { StatusPillAuto } from './StatusPill';

interface OrderCardProps {
  item: {
    id: number;
    status: string;
    totalKes: number | string | null;
    createdAt?: string;
    items?: Array<{ listing?: { name: string } }>;
  };
}

export default function OrderCard({ item }: OrderCardProps) {
  const router = useRouter();
  const itemCount = item.items?.length || 0;
  const firstTitle = item.items?.[0]?.listing?.name || '';
  return (
    <Pressable
      onPress={() => router.push('/orders/' + item.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.orderNum}>Order #ORD-{item.id}</Text>
          <StatusPillAuto status={item.status || 'pending'} />
        </View>
        {itemCount > 0 ? (
          <Text style={styles.items}>
            {itemCount === 1 ? firstTitle : firstTitle + ' +' + (itemCount - 1) + ' more'}
          </Text>
        ) : null}
        <View style={styles.footer}>
          <Text style={styles.total}>{formatKes(item.totalKes)}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  orderNum: { ...typography.label, color: colors.emerald },
  items: { ...typography.body, marginBottom: spacing.sm },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total: { ...typography.h2, color: colors.emeraldDark },
  date: { ...typography.small, color: colors.inkSoft },
});

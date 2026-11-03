import React from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { useAuthUser, useAuthStatus } from '../../src/features/useAuth';
import { useDashboardStats } from '../../src/features/useDashboardStats';
import { useMyProduce } from '../../src/features/useProduce';
import { useOrders } from '../../src/features/useOrders';
import { useServiceRequests } from '../../src/features/useServices';
import { ORDER_STATUS, ROLE_LABELS } from '../../src/constants';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';
import Button from '../../src/components/Button';
import { Avatar } from '../../src/components/Avatar';
import { ApiError } from '../../src/api/client';

const QUICK_ACTIONS: Record<string, Array<{ label: string; icon: string; href: string }>> = {
  farmer: [
    { label: 'My Produce', icon: 'cube', href: '/produce/' },
    { label: 'My Orders', icon: 'receipt', href: '/orders/' },
    { label: 'Market', icon: 'storefront', href: '/marketplace' },
  ],
  buyer: [
    { label: 'Market', icon: 'storefront', href: '/marketplace' },
    { label: 'My Orders', icon: 'receipt', href: '/orders/' },
    { label: 'Market Prices', icon: 'trending-up', href: '/market-prices' },
  ],
  provider: [
    { label: 'Service Requests', icon: 'construct', href: '/services' },
    { label: 'All Services', icon: 'briefcase', href: '/services' },
    { label: 'My Orders', icon: 'receipt', href: '/orders/' },
  ],
};

export default function DashboardScreen() {
  const router = useRouter();
  const user = useAuthUser();
  const status = useAuthStatus();
  const role = user?.role || 'farmer';

  const { data: stats, isPending: statsLoading, isError: statsError, refetch: refetchStats } = useDashboardStats();
  const { data: myProduce, isPending: produceLoading } = useMyProduce();
  const { data: orders, isPending: ordersLoading } = useOrders();
  const { data: serviceRequests, isPending: requestsLoading } = useServiceRequests(role === 'provider' ? 'provider' : undefined);

  if (status !== 'authenticated') return null;
  if (statsLoading && !stats) return <LoadingState label="Loading dashboard…" />;
  if (statsError) return <ErrorState message="Could not load dashboard stats." onRetry={() => refetchStats()} />;

  const actions = QUICK_ACTIONS[role] || QUICK_ACTIONS.farmer;
  const produceCount = myProduce?.length || 0;
  const orderCount = orders?.length || 0;
  const pendingRequests = (serviceRequests || []).filter((r) => r.status === 'PENDING' || r.status === 'ACCEPTED').length;
  const pendingOrders = (orders || []).filter((o) => o.status === 'pending' || o.status === 'confirmed').length;

  const statCards = [
    role === 'farmer' ? { label: 'Listings', value: produceCount, icon: 'cube', color: colors.emerald } : null,
    { label: role === 'farmer' ? 'Sales' : role === 'buyer' ? 'Orders' : 'Requests', value: role === 'farmer' ? (myProduce || []).reduce((s, p) => s + Number(p.sales?.revenue || 0), 0) : orderCount, icon: role === 'farmer' ? 'bar-chart' : 'receipt', color: colors.gold },
    { label: 'Pending', value: role === 'farmer' ? pendingOrders : role === 'provider' ? pendingRequests : pendingOrders, icon: role === 'provider' ? 'time' : 'warning', color: colors.warning },
  ].filter(Boolean) as Array<{ label: string; value: number | string; icon: string; color: string }>;

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.row}>
          <Avatar name={user?.full_name || user?.fullName || ''} size={56} />
          <View style={styles.nameCol}>
            <Text style={typography.h2} numberOfLines={1}>Good morning, {(user?.full_name || user?.fullName || 'there').split(' ')[0]}!</Text>
            <Text style={styles.role}>{ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role}</Text>
          </View>
        </View>
      </View>

      <View style={styles.statsRow}>
        {statCards.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.color + '15' }]}>
            <Ionicons name={s.icon as any} size={24} color={s.color} />
            <Text style={styles.statValue}>{typeof s.value === 'number' && s.label === 'Sales' ? 'KES ' + Number(s.value).toLocaleString() : s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Quick actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((a) => (
          <Pressable
            key={a.href}
            onPress={() => router.push(a.href as any)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.actionBtn]}
          >
            <Ionicons name={a.icon as any} size={28} color={colors.emerald} />
            <Text style={styles.actionLbl}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      {role === 'farmer' && produceCount > 0 && (
        <>
          <Text style={styles.sectionTitle}>Your recent produce</Text>
          <View style={styles.recentList}>
            {myProduce!.slice(0, 3).map((item) => (
              <View key={item.id} style={styles.recentItem}>
                <Text style={styles.recentName}>{item.name}</Text>
                <StatusPillAuto status={item.status || 'LISTED'} />
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// Import StatusPillAuto here to avoid circular import issues
import { StatusPillAuto } from '../../src/components/StatusPill';

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  header: { marginBottom: spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  nameCol: { flex: 1 },
  role: { ...typography.small, color: colors.inkSoft },
  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
  statCard: {
    flex: 1, backgroundColor: colors.white, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', ...shadows.card,
  },
  statValue: { ...typography.h2, marginTop: 4 },
  statLabel: { ...typography.small, color: colors.inkSoft },
  sectionTitle: { ...typography.h2, marginBottom: spacing.sm },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  actionBtn: {
    width: '46%', backgroundColor: colors.white, borderRadius: radius.md,
    padding: spacing.md, alignItems: 'center', gap: 6, ...shadows.card,
  },
  actionLbl: { ...typography.small, fontWeight: '600' },
  recentList: { gap: spacing.xs },
  recentItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.stone,
  },
  recentName: { ...typography.body },
});

import { StatusBar } from 'expo-status-bar';

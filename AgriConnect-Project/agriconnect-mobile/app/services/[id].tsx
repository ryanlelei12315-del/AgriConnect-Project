import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { useAuthUser } from '../../src/features/useAuth';
import { useService } from '../../src/features/useServices';
import Button from '../../src/components/Button';
import { StatusPillAuto } from '../../src/components/StatusPill';
import { LoadingState, ErrorState } from '../../src/components/States';
import { formatKes, initials } from '../../src/utils/format';

export default function ServiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const serviceId = id ? Number(id) : 0;
  const router = useRouter();
  const currentUser = useAuthUser();

  const { data: service, isPending, isError, refetch } = useService(serviceId);

  if (!serviceId) return <LoadingState label="Invalid service…" />;
  if (isPending) return <LoadingState label="Loading service…" />;
  if (isError) return <ErrorState message="Could not load service." onRetry={() => refetch()} />;
  if (!service) return <ErrorState message="Service not found." />;

  const isProvider = service.provider?.id === currentUser?.id;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{getCategoryIcon(service.category)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{service.title}</Text>
            <Text style={styles.sub}>{service.category} · {service.county}</Text>
            <Text style={styles.price}>{formatKes(service.priceKes)} / job</Text>
          </View>
          <StatusPillAuto status={service.availability || 'AVAILABLE'} />
        </View>
      </View>

      {service.provider ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Provider</Text>
          <View style={styles.providerRow}>
            <View style={styles.providerAvatar}>
              <Text style={styles.providerInit}>{initials(service.provider?.fullName || (service.provider as any)?.full_name || '')}</Text>
            </View>
            <View>
              <Text style={styles.providerName}>{service.provider?.fullName || (service.provider as any)?.full_name || 'Unknown'}</Text>
              <Text style={styles.providerCounty}>{service.provider.county}</Text>
              <Text style={styles.providerPhone}>📞 {service.provider?.phoneNumber || (service.provider as any)?.phone_number || '—'}</Text>
            </View>
          </View>
        </View>
      ) : null}

      {service.description ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>About</Text>
          <Text style={styles.desc}>{service.description}</Text>
        </View>
      ) : null}

      {!isProvider && service.availability === 'AVAILABLE' ? (
        <Button
          title="Request This Service"
          onPress={() => router.push('/services/request?serviceId=' + service.id)}
        />
      ) : null}
    </ScrollView>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Machinery: '🔧', Transport: '🚚', Infrastructure: '🏗️',
    Labour: '👷', Agronomy: '🌿', Other: '📋',
  };
  return icons[category] || '🔧';
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: colors.cream, padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg, ...shadows.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox: {
    width: 56, height: 56, borderRadius: radius.md,
    backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center',
  },
  icon: { fontSize: 32 },
  title: { ...typography.h1, fontSize: 22 },
  sub: { ...typography.small, color: colors.inkSoft, marginTop: 2 },
  price: { ...typography.h2, color: colors.emeraldDark, marginTop: 4 },
  cardTitle: { ...typography.label, color: colors.inkSoft, marginBottom: spacing.sm },
  providerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  providerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: colors.emerald, alignItems: 'center', justifyContent: 'center',
  },
  providerInit: { color: colors.white, fontSize: 16, fontWeight: '700' },
  providerName: { ...typography.h2, fontSize: 15 },
  providerCounty: { ...typography.small, color: colors.inkSoft },
  providerPhone: { ...typography.small, color: colors.inkSoft },
  desc: { ...typography.body, color: colors.inkMid, lineHeight: 20 },
});

import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatKes } from '../utils/format';
import { StatusPillAuto } from './StatusPill';

interface ServiceCardProps {
  item: {
    id: number;
    category: string;
    title: string;
    priceKes: number | string;
    county: string;
    availability: string;
    provider?: { id: number; fullName?: string; full_name?: string; county?: string | null; phoneNumber?: string };
  };
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Machinery: '🔧', Transport: '🚚', Infrastructure: '🏗️',
    Labour: '👷', Agronomy: '🌿', Other: '📋',
  };
  return icons[category] || '🔧';
}

export default function ServiceCard({ item }: ServiceCardProps) {
  const router = useRouter();
  return (
    <Pressable
      onPress={() => router.push('/services/' + item.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }]}
    >
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconBox}>
            <Text style={styles.icon}>{getCategoryIcon(item.category)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.title}</Text>
              <StatusPillAuto status={item.availability || 'AVAILABLE'} />
            </View>
            <Text style={styles.sub}>{item.category} · {item.county}</Text>
            <Text style={styles.price}>{formatKes(item.priceKes)} / job</Text>
          </View>
        </View>
        {item.provider ? (
          <Text style={styles.provider}>by {item.provider.fullName || item.provider.full_name || 'Provider'}</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.sm, ...shadows.card },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBox: { width: 44, height: 44, borderRadius: radius.md, backgroundColor: colors.infoBg, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { ...typography.h2, fontSize: 16, flex: 1 },
  sub: { ...typography.small, color: colors.inkSoft },
  price: { ...typography.h2, color: colors.emeraldDark, marginTop: 2 },
  provider: { ...typography.small, color: colors.inkSoft, marginTop: spacing.xs },
});

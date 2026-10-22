import React from 'react';
import { StyleSheet, View, Text, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../theme';
import { formatKes } from '../utils/format';
import { StatusPillAuto } from './StatusPill';
import { API_BASE_URL } from '../constants';

interface ProduceCardProps {
  item: {
    id: number;
    name: string;
    category: string;
    quantityKg: number | string;
    pricePerKgKes: number | string;
    county: string;
    imageUrl?: string | null;
    status: string;
    farmer?: { id: number; fullName?: string; full_name?: string; county?: string | null; phoneNumber?: string };
  };
}

export default function ProduceCard({ item }: ProduceCardProps) {
  const router = useRouter();
  const imageUrl = item.imageUrl;
  const resolvedImage = imageUrl ? (imageUrl.startsWith('http') ? imageUrl : API_BASE_URL.replace(/\/$/, '') + imageUrl) : null;
  return (
    <Pressable
      onPress={() => router.push('/marketplace/' + item.id)}
      style={({ pressed }) => [{ opacity: pressed ? 0.8 : 1 }, styles.cardWrap]}
    >
      <View style={styles.card}>
        {resolvedImage ? (
          <Image source={{ uri: resolvedImage }} style={styles.image} accessibilityLabel={item.name} />
        ) : (
          <View style={[styles.image, styles.placeholder]}>
            <Text style={styles.placeholderText}>{item.name?.split(' ')[0]?.charAt(0) || '🌱'}</Text>
          </View>
        )}
        <View style={styles.body}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.name}</Text>
            <StatusPillAuto status={item.status || 'LISTED'} />
          </View>
          <Text style={styles.detail}>{item.category} · {item.county}</Text>
          {item.farmer ? (
            <Text style={styles.farmer}>{item.farmer.fullName || item.farmer.full_name || 'Unknown farmer'}</Text>
          ) : null}
          <View style={styles.bottom}>
            <Text style={styles.price}>{formatKes(item.pricePerKgKes)}</Text>
            <Text style={styles.qty}>{Number(item.quantityKg)} kg available</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cardWrap: { flex: 1, minWidth: 160, marginBottom: spacing.md },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.stone, ...shadows.card },
  image: { width: '100%', height: 120, backgroundColor: colors.linen },
  placeholder: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontSize: 36 },
  body: { padding: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  name: { ...typography.h2, fontSize: 14, flex: 1, marginRight: spacing.xs },
  detail: { ...typography.small, marginBottom: 2 },
  farmer: { ...typography.small, color: colors.emerald, marginBottom: spacing.xs },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { ...typography.h2, color: colors.emeraldDark },
  qty: { ...typography.small },
});

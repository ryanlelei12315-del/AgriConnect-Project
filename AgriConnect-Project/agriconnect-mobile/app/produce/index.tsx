import React, { useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Text } from 'react-native';
import { colors, spacing, typography } from '../../src/theme';
import { useMyProduce } from '../../src/features/useProduce';
import Button from '../../src/components/Button';
import { StatusPillAuto } from '../../src/components/StatusPill';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';
import { formatKes } from '../../src/utils/format';

export default function MyProduceScreen() {
  const router = useRouter();
  const { data, isPending, isError, refetch, error } = useMyProduce();
  const produce = data || [];
  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <View style={styles.container}>
      <Button title="New Listing" onPress={() => router.push('/produce/new')} variant="secondary" style={styles.newBtn} />
      {isPending ? (
        <LoadingState label="Loading your produce…" />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load produce.'} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={produce}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.item]}
              onPress={() => router.push('/produce/' + item.id)}
            >
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <Ionicons name="cube" size={20} color={colors.emerald} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemName}>{item.name}</Text>
                    <Text style={styles.itemCat}>{item.category} · {item.county}</Text>
                  </View>
                  <StatusPillAuto status={item.status || 'LISTED'} />
                </View>
                <View style={styles.itemBottom}>
                  <Text style={styles.itemPrice}>{formatKes(item.pricePerKgKes)}/kg</Text>
                  <Text style={styles.itemQty}>{Number(item.quantityKg)} kg</Text>
                  {item.sales ? (
                    <Text style={styles.sales}>{item.sales.kgSold} kg sold · {formatKes(item.sales.revenue)} earn</Text>
                  ) : null}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
            </Pressable>
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isPending} onRefresh={onRefresh} tintColor={colors.emerald} />}
          ListEmptyComponent={<EmptyState title="No produce listed yet" message="Tap New Listing to add your first listing." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  newBtn: { margin: 16, alignSelf: 'flex-start' },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  item: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.white, borderRadius: 12, padding: spacing.md,
    marginBottom: spacing.sm, ...require('../../src/theme').shadows.card,
  },
  itemInfo: { flex: 1 },
  itemHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  itemName: { ...typography.h2, fontSize: 15 },
  itemCat: { ...typography.small, color: colors.inkSoft },
  itemBottom: { gap: 2 },
  itemPrice: { ...typography.h2, color: colors.emeraldDark },
  itemQty: { ...typography.small, color: colors.inkSoft },
  sales: { ...typography.small, color: colors.success, fontWeight: '600' },
});

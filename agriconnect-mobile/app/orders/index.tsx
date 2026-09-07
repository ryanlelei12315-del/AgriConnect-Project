import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { colors, spacing } from '../../src/theme';
import { ORDER_STATUS } from '../../src/constants';
import { useOrders } from '../../src/features/useOrders';
import ChoiceChips from '../../src/components/ChoiceChips';
import OrderCard from '../../src/components/OrderCard';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';

export default function OrdersScreen() {
  const [statusFilter, setStatusFilter] = useState('All');
  const { data, isPending, isError, refetch, error } = useOrders(
    statusFilter === 'All' ? undefined : statusFilter
  );
  const orders = data || [];

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  return (
    <View style={styles.container}>
      <ChoiceChips
        options={['All', ...Object.keys(ORDER_STATUS)] as readonly string[]}
        value={statusFilter}
        onChange={setStatusFilter}
        allowEmpty
      />
      {isPending ? (
        <LoadingState label="Loading orders…" />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load orders.'} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <OrderCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isPending} onRefresh={onRefresh} tintColor={colors.emerald} />}
          ListEmptyComponent={<EmptyState title="No orders yet" message="Orders you place will appear here." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  list: { paddingBottom: 40 },
});

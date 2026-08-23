import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography } from '../../src/theme';
import { PRODUCE_CATEGORIES } from '../../src/constants';
import { useListings } from '../../src/features/useListings';
import ChoiceChips from '../../src/components/ChoiceChips';
import ProduceCard from '../../src/components/ProduceCard';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';

export default function MarketplaceScreen() {
  const router = useRouter();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isPending, isError, refetch, error } = useListings({
    category,
    search: searchQuery || undefined,
  });

  const listings = data || [];

  const onRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const onSearch = () => {
    setSearchQuery(search.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Input
          placeholder="Search produce…"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <ChoiceChips
          options={['All', ...PRODUCE_CATEGORIES] as readonly string[]}
          value={category}
          onChange={setCategory}
          allowEmpty
        />
        <Button title="Search" onPress={onSearch} variant="outline" fullWidth={false} style={styles.searchBtn} />
      </View>

      {isPending ? (
        <LoadingState label="Loading market…" />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load listings.'} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ProduceCard item={item} />}
          numColumns={2}
          columnWrapperStyle={{ gap: spacing.sm }}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isPending} onRefresh={onRefresh} tintColor={colors.emerald} />}
          ListEmptyComponent={<EmptyState title="No produce found" message="Try adjusting your filters." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream, padding: 16 },
  toolbar: { marginBottom: spacing.md },
  searchInput: { flex: 1, marginBottom: 0 },
  searchBtn: { height: 40, paddingHorizontal: 16, alignSelf: 'flex-start', marginTop: spacing.sm },
  list: { paddingBottom: 40 },
});

import { StatusPillAuto } from '../../src/components/StatusPill';

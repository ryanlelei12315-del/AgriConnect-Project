import React, { useState, useCallback } from 'react';
import { StyleSheet, View, FlatList, RefreshControl } from 'react-native';
import { colors, spacing } from '../../src/theme';
import { SERVICE_CATEGORIES } from '../../src/constants';
import { useServices } from '../../src/features/useServices';
import ChoiceChips from '../../src/components/ChoiceChips';
import ServiceCard from '../../src/components/ServiceCard';
import Input from '../../src/components/Input';
import Button from '../../src/components/Button';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';

export default function ServicesScreen() {
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isPending, isError, refetch, error } = useServices(category, searchQuery || undefined);
  const services = data || [];

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);
  const onSearch = () => { setSearchQuery(search.trim()); };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <Input placeholder="Search services…" value={search} onChangeText={setSearch} style={styles.searchInput} />
        <ChoiceChips
          options={['All', ...SERVICE_CATEGORIES] as readonly string[]}
          value={category}
          onChange={setCategory}
          allowEmpty
        />
        <Button title="Search" onPress={onSearch} variant="outline" fullWidth={false} style={styles.searchBtn} />
      </View>

      {isPending ? (
        <LoadingState label="Loading services…" />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load services.'} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={services}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => <ServiceCard item={item} />}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isPending} onRefresh={onRefresh} tintColor={colors.emerald} />}
          ListEmptyComponent={<EmptyState title="No services found" message="Try adjusting your filters." />}
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

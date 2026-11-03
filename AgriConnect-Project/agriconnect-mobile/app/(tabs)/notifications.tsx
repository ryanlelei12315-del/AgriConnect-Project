import React, { useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, Pressable, RefreshControl } from 'react-native';
import { colors, spacing, typography, radius } from '../../src/theme';
import { useNotifications, useMarkNotificationRead } from '../../src/features/useNotifications';
import { timeAgo } from '../../src/utils/format';
import { LoadingState, EmptyState, ErrorState } from '../../src/components/States';
import Button from '../../src/components/Button';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
  const { data, isPending, isError, refetch, error } = useNotifications();
  const markRead = useMarkNotificationRead();
  const notifications = data || [];

  const onMarkAllRead = () => {
    notifications.filter((n) => !n.isRead).forEach((n) => markRead.mutate(n.id));
  };

  const onRefresh = useCallback(() => { refetch(); }, [refetch]);

  const renderItem = ({ item }: { item: typeof notifications[0] }) => (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.item, !item.isRead && styles.unread]}
      onPress={() => { if (!item.isRead) markRead.mutate(item.id); }}
    >
      <View style={styles.itemBody}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.message}>{item.message}</Text>
        {item.createdAt ? <Text style={styles.time}>{timeAgo(item.createdAt)}</Text> : null}
      </View>
      {!item.isRead ? <View style={styles.badge} /> : null}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {notifications.length > 0 && notifications.some((n) => !n.isRead) ? (
        <Button title="Mark all as read" onPress={onMarkAllRead} variant="outline" fullWidth={false} style={styles.markAllBtn} />
      ) : null}

      {isPending ? (
        <LoadingState label="Loading alerts…" />
      ) : isError ? (
        <ErrorState message={(error as Error)?.message || 'Failed to load notifications.'} onRetry={() => refetch()} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={isPending} onRefresh={onRefresh} tintColor={colors.emerald} />}
          ListEmptyComponent={<EmptyState title="All caught up!" message="You have no new notifications." />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  markAllBtn: { alignSelf: 'flex-end', margin: 16 },
  list: { paddingBottom: 40 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.stone,
  },
  itemBody: { flex: 1 },
  title: { ...typography.h2, fontSize: 14, marginBottom: 2 },
  message: { ...typography.body, color: colors.inkMid },
  time: { ...typography.small, color: colors.inkSoft, marginTop: 4 },
  unread: { backgroundColor: colors.infoBg },
  badge: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.gold },
});

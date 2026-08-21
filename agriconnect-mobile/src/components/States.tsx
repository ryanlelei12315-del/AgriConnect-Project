import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../theme';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.emerald} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>🌾</Text>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center}>
      <Text style={styles.emoji}>⚠️</Text>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Text style={styles.retry} onPress={onRetry}>
          Tap to retry
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 8 },
  emoji: { fontSize: 44, marginBottom: 8 },
  title: { ...typography.h1, textAlign: 'center' },
  text: { ...typography.body, textAlign: 'center', color: colors.inkSoft },
  retry: { color: colors.emerald, fontWeight: '700', marginTop: 8 },
});

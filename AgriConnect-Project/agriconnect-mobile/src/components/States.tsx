import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';

export function LoadingState({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.emerald} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function EmptyState({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.center} accessibilityRole="summary">
      <View style={styles.iconWrap}><Ionicons name="leaf-outline" size={28} color={colors.emerald} /></View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.text}>{message}</Text> : null}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.center} accessibilityRole="alert">
      <View style={[styles.iconWrap, styles.errorIcon]}><Ionicons name="alert-circle-outline" size={28} color={colors.danger} /></View>
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.text}>{message}</Text>
      {onRetry ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Try again" onPress={onRetry} style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: 8 },
  iconWrap: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center', borderRadius: 28, backgroundColor: colors.successBg, marginBottom: 8 },
  errorIcon: { backgroundColor: colors.dangerBg },
  title: { ...typography.h1, textAlign: 'center' },
  text: { ...typography.body, textAlign: 'center', color: colors.inkSoft },
  retry: { minHeight: 44, justifyContent: 'center', paddingHorizontal: spacing.lg, marginTop: 8, borderRadius: 22, backgroundColor: colors.emerald },
  retryPressed: { opacity: 0.82 },
  retryText: { color: colors.white, fontWeight: '700' },
});

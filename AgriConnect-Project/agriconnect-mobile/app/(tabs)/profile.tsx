import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, radius, typography, shadows } from '../../src/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useProfile } from '../../src/features/useProfile';
import { StatusPillAuto } from '../../src/components/StatusPill';
import Avatar from '../../src/components/Avatar';
import Button from '../../src/components/Button';
import { LoadingState, ErrorState } from '../../src/components/States';
import { formatDate } from '../../src/utils/format';
import { ROLE_LABELS } from '../../src/constants';
import { ApiError } from '../../src/api/client';

export default function ProfileScreen() {
  const router = useRouter();
  const { status: authStatus, user: authUser, logout } = useAuthStore();
  const { data: profile, isPending, isError, refetch } = useProfile();

  const user = profile || authUser;
  const role = user?.role || '';

  if (authStatus !== 'authenticated') return null;
  if (isPending && !profile) return <LoadingState label="Loading profile…" />;
  if (isError) return <ErrorState message="Could not load profile." onRetry={() => refetch()} />;

  const handleLogout = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => {
        logout().catch(() => {});
        router.replace('/login');
      } },
    ]);
  };

  const fullName = user?.fullName || user?.full_name || 'Unknown';
  const displayRole = role && ROLE_LABELS[role as keyof typeof ROLE_LABELS] || role;

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Avatar name={fullName} uri={user?.profileImage} size={72} />
        <Text style={typography.h1}>{fullName}</Text>
        <StatusPillAuto status={role || 'user'} />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <ProfileRow label="Role" value={displayRole} />
        <ProfileRow label="Email" value={user?.email || '—'} />
        <ProfileRow label="Phone" value={user?.phoneNumber || user?.phone_number || '—'} />
        <ProfileRow label="County" value={user?.county || '—'} />
        {user?.createdAt ? <ProfileRow label="Member since" value={formatDate(user.createdAt)} /> : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Settings</Text>
        <ActionRow icon="person" label="Edit Profile" onPress={() => router.push('/profile/edit')} />
        <ActionRow icon="lock" label="Change Password" onPress={() => router.push('/profile/password')} />
        <ActionRow icon="notifications" label="Notifications" value="On" />
      </View>

      <Button title="Sign Out" onPress={handleLogout} variant="danger" />
    </ScrollView>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function ActionRow({ icon, label, value, onPress }: {
  icon: string; value?: string; label: string; onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }, styles.actionRow]}>
      <View style={styles.actionLeft}>
        <Ionicons name={icon as any} size={20} color={colors.emerald} />
        <Text style={styles.actionLabel}>{label}</Text>
      </View>
      {value ? <Text style={styles.actionValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={20} color={colors.inkSoft} />
    </Pressable>
  );
}

import { Ionicons } from '@expo/vector-icons';

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: 16, paddingBottom: 40 },
  header: { alignItems: 'center', gap: spacing.xs, marginBottom: spacing.xl },
  card: {
    backgroundColor: colors.white, borderRadius: radius.lg,
    padding: spacing.md, marginBottom: spacing.lg, ...shadows.card,
  },
  cardTitle: { ...typography.label, color: colors.inkSoft, marginBottom: spacing.sm },
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.stone,
  },
  rowLabel: { ...typography.body, color: colors.inkMid },
  rowValue: { ...typography.body, color: colors.ink, fontWeight: '500' },
  actionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.stone,
  },
  actionLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  actionLabel: { ...typography.body },
  actionValue: { ...typography.small, color: colors.inkSoft },
});

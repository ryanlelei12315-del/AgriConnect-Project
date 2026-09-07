import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

/** Colored pill showing a status like LISTED / pending / ACCEPTED. */
export function StatusPill({ label, tone }: { label: string; tone?: 'green' | 'gold' | 'red' | 'grey' }) {
  const bg =
    tone === 'green'
      ? colors.successBg
      : tone === 'gold'
        ? colors.warningBg
        : tone === 'red'
          ? colors.dangerBg
          : colors.linen;
  const fg =
    tone === 'green'
      ? colors.success
      : tone === 'gold'
        ? colors.gold
        : tone === 'red'
          ? colors.danger
          : colors.inkSoft;
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{label}</Text>
    </View>
  );
}

/** Pick a tone automatically from a raw status string. */
export function StatusPillAuto({ status }: { status: string }) {
  const s = (status || '').toUpperCase();
  const tone =
    s === 'LISTED' || s === 'AVAILABLE' || s === 'COMPLETED' || s === 'ACCEPTED' || s === 'confirmed' || s === 'shipped' || s === 'completed'
      ? 'green'
      : s === 'PENDING' || s === 'pending'
        ? 'gold'
        : s === 'REJECTED' || s === 'CANCELLED' || s === 'canceled' || s === 'INACTIVE' || s === 'UNAVAILABLE' || s === 'BOOKED'
          ? 'red'
          : 'grey';
  const pretty =
    s.charAt(0) + s.slice(1).toLowerCase().replace('_', ' ');
  return <StatusPill label={pretty} tone={tone as 'green' | 'gold' | 'red' | 'grey'} />;
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});

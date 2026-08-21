import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';
import { initials } from '../utils/format';
import { API_BASE_URL } from '../constants';

interface AvatarProps {
  name?: string;
  uri?: string | null;
  size?: number;
}

/** Show an image if present, otherwise a colored initials circle. */
export default function Avatar({ name, uri, size = 48 }: AvatarProps) {
  const style = { width: size, height: size, borderRadius: size / 2 };
  if (uri) {
    const src = uri.startsWith('http') ? uri : `${API_BASE_URL}${uri}`;
    return <Image source={{ uri: src }} style={[style, { backgroundColor: colors.linen }]} />;
  }
  return (
    <View style={[styles.circle, style]}>
      <Text style={{ color: colors.white, fontSize: size * 0.4, fontWeight: '700' }}>{initials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.emerald,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  style?: StyleProp<ViewStyle>;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  style,
  fullWidth = true,
}: ButtonProps) {
  const bg: Record<ButtonProps['variant'] & string, string> = {
    primary: colors.emerald,
    secondary: colors.gold,
    outline: 'transparent',
    ghost: 'transparent',
    danger: colors.danger,
  };

  const textColor: Record<string, string> = {
    primary: colors.white,
    secondary: colors.white,
    outline: colors.emerald,
    ghost: colors.emerald,
    danger: colors.white,
  };

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: bg[variant] },
        variant === 'outline' && styles.outline,
        fullWidth && styles.full,
        pressed && !isDisabled && { opacity: 0.85 },
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} />
      ) : (
        <Text style={[styles.text, { color: textColor[variant] }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  full: { alignSelf: 'stretch' },
  outline: { borderWidth: 1.5, borderColor: colors.emerald },
  disabled: { opacity: 0.5 },
  text: { ...typography.button, fontSize: 15 },
});

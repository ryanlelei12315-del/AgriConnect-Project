import React from 'react';
import { StyleSheet, Text, TextInput, View, TextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={colors.inkSoft}
        style={[styles.input, error ? styles.inputError : null, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { ...typography.label, marginBottom: 6 },
  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: colors.stone,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12.5, marginTop: 4 },
});

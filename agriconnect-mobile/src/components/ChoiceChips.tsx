import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';

interface ChoiceChipsProps {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
  allowEmpty?: boolean;
}

/** Horizontal/wrapping selectable chips (role, category, county, status). */
export default function ChoiceChips({ options, value, onChange, allowEmpty = false }: ChoiceChipsProps) {
  return (
    <View style={styles.wrap}>
      {options.map((opt) => {
        const selected = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(selected && allowEmpty ? '' : opt)}
            style={[styles.chip, selected && styles.selected]}
          >
            <Text style={[styles.text, selected && styles.textSelected]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.stone,
  },
  selected: { backgroundColor: colors.emerald, borderColor: colors.emerald },
  text: { color: colors.inkMid, fontSize: 14 },
  textSelected: { color: colors.white, fontWeight: '600' },
});

import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../utils/theme';

export const Input = ({ label, error, style, ...props }) => (
  <View style={[styles.container, style]}>
    {label && <Text style={styles.label}>{label}</Text>}
    <TextInput
      style={[styles.input, error && { borderColor: colors.danger }]}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
    {error && <Text style={styles.error}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '500', color: colors.textSecondary, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    paddingHorizontal: spacing.md, paddingVertical: 10,
    fontSize: 14, color: colors.text, backgroundColor: colors.surface,
  },
  error: { fontSize: 12, color: colors.danger, marginTop: 4 },
});

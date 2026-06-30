import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../utils/theme';

export const EmptyState = ({ icon = '📭', title, subtitle }) => (
  <View style={styles.container}>
    <Text style={styles.icon}>{icon}</Text>
    <Text style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  icon: { fontSize: 40, marginBottom: spacing.lg },
  title: { fontSize: 16, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },
  subtitle: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: spacing.sm },
});

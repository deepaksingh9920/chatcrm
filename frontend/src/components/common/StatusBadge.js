import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { statusColors } from '../../utils/theme';

export const StatusBadge = ({ status }) => {
  const colors = statusColors[status] || { bg: '#F1F5F9', text: '#475569' };
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{status}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '500' },
});

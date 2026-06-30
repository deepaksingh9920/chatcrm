import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius } from '../../utils/theme';

export const Button = ({ title, onPress, variant = 'primary', size = 'md', loading, disabled, style }) => {
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.surface;
  const textColor = variant === 'ghost' ? colors.primary : '#fff';
  const border = variant === 'ghost' ? { borderWidth: 1, borderColor: colors.border } : {};
  const pad = size === 'sm' ? { paddingVertical: 6, paddingHorizontal: 12 } : { paddingVertical: 10, paddingHorizontal: 18 };
  return (
    <TouchableOpacity
      onPress={onPress} disabled={disabled || loading}
      style={[styles.btn, { backgroundColor: bg }, border, pad, style, (disabled || loading) && { opacity: 0.6 }]}
    >
      {loading ? <ActivityIndicator color={textColor} size="small" /> :
        <Text style={[styles.text, { color: textColor, fontSize: size === 'sm' ? 13 : 14 }]}>{title}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: { borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  text: { fontWeight: '600' },
});

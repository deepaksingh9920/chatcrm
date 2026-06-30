import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getAvatarColors, getInitials } from '../../utils/theme';

export const Avatar = ({ name = '', size = 36 }) => {
  const [bg, txt] = getAvatarColors(name);
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.text, { color: txt, fontSize: size * 0.33 }]}>{getInitials(name)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '600' },
});

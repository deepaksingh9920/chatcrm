import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../utils/theme';

export const LoginScreen = ({ navigation }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      Alert.alert('Login failed', err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>💬</Text>
          </View>
          <Text style={styles.brand}>ChatCRM</Text>
          <Text style={styles.tagline}>Manage customers from a single conversation</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.title}>Welcome back</Text>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry />
          <Button title="Sign in" onPress={handleLogin} loading={loading} style={{ marginTop: spacing.sm }} />

          <View style={styles.divider}>
            <View style={styles.line} /><Text style={styles.orText}>or</Text><View style={styles.line} />
          </View>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>New company? <Text style={{ color: colors.primary, fontWeight: '600' }}>Create account →</Text></Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo credentials</Text>
            <Text style={styles.demoText}>Email: owner@chatcrm.com</Text>
            <Text style={styles.demoText}>Password: password123</Text>
            <TouchableOpacity onPress={() => { setEmail('owner@chatcrm.com'); setPassword('password123'); }}>
              <Text style={[styles.demoText, { color: colors.primary, marginTop: 4 }]}>Tap to fill →</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: spacing.xl },
  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  logo: { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoText: { fontSize: 36 },
  brand: { fontSize: 28, fontWeight: '700', color: colors.text },
  tagline: { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
  form: { backgroundColor: colors.surface, borderRadius: 16, padding: spacing.xl, borderWidth: 1, borderColor: colors.border },
  title: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  orText: { marginHorizontal: spacing.md, color: colors.textMuted, fontSize: 13 },
  registerLink: { textAlign: 'center', fontSize: 14, color: colors.textSecondary },
  demoBox: { marginTop: spacing.lg, backgroundColor: colors.primaryLight, borderRadius: 8, padding: spacing.md },
  demoTitle: { fontSize: 12, fontWeight: '600', color: colors.primary, marginBottom: 4 },
  demoText: { fontSize: 12, color: colors.textSecondary },
});

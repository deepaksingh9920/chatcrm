import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../utils/theme';

export const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const [form, setForm] = useState({ companyName: '', name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  const handleRegister = async () => {
    if (!form.companyName || !form.name || !form.email || !form.password) {
      return Alert.alert('Error', 'Please fill in all required fields');
    }
    if (form.password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      Alert.alert('Registration failed', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Back to login</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Set up your company on ChatCRM</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Company details</Text>
          <Input label="Company name *" value={form.companyName} onChangeText={set('companyName')} placeholder="Rajesh Enterprises" />
          <Input label="Company phone" value={form.phone} onChangeText={set('phone')} placeholder="+91 98200 00000" keyboardType="phone-pad" />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your details</Text>
          <Input label="Your name *" value={form.name} onChangeText={set('name')} placeholder="Rajesh Kumar" />
          <Input label="Email *" value={form.email} onChangeText={set('email')} placeholder="you@company.com" keyboardType="email-address" autoCapitalize="none" />
          <Input label="Password *" value={form.password} onChangeText={set('password')} placeholder="Min 6 characters" secureTextEntry />
        </View>

        <Button title="Create account" onPress={handleRegister} loading={loading} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.bg, padding: spacing.xl },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '500' },
  title: { fontSize: 24, fontWeight: '700', color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginBottom: spacing.xl },
  section: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.5 },
});

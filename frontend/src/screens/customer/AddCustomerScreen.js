import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import { api } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../utils/theme';

export const AddCustomerScreen = ({ navigation }) => {
  const [form, setForm] = useState({ name:'', phone:'', email:'', companyName:'', gstin:'', city:'', state:'' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name) return Alert.alert('Error', 'Customer name is required');
    setLoading(true);
    try {
      const customer = await api.createCustomer(form);
      navigation.replace('Conversation', { customerId: customer.id, customerName: customer.name });
    } catch (err) {
      Alert.alert('Error', err.message || 'Could not create customer');
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic info</Text>
        <Input label="Full name *" value={form.name} onChangeText={set('name')} placeholder="Rajesh Kumar" />
        <Input label="Mobile number" value={form.phone} onChangeText={set('phone')} placeholder="+91 98200 12345" keyboardType="phone-pad" />
        <Input label="Email" value={form.email} onChangeText={set('email')} placeholder="rajesh@company.com" keyboardType="email-address" autoCapitalize="none" />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business info</Text>
        <Input label="Company name" value={form.companyName} onChangeText={set('companyName')} placeholder="Rajesh Enterprises" />
        <Input label="GST number" value={form.gstin} onChangeText={set('gstin')} placeholder="27AABCR1234F1Z5" autoCapitalize="characters" />
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        <Input label="City" value={form.city} onChangeText={set('city')} placeholder="Mumbai" />
        <Input label="State" value={form.state} onChangeText={set('state')} placeholder="Maharashtra" />
      </View>
      <View style={{ padding: spacing.lg }}>
        <Button title="Save customer" onPress={handleSave} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.md },
});

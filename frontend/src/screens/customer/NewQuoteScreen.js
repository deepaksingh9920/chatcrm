import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { api } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing, formatCurrency } from '../../utils/theme';

const defaultItem = () => ({ id: Date.now().toString(), name: '', qty: '1', price: '', tax: '18' });

export const NewQuoteScreen = ({ route, navigation }) => {
  const { customerId, customerName } = route.params;
  const [items, setItems] = useState([defaultItem()]);
  const [notes, setNotes] = useState('');
  const [validTill, setValidTill] = useState('');
  const [loading, setLoading] = useState(false);

  const updateItem = (idx, key, val) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: val } : it));
  };

  const subtotal = items.reduce((sum, it) => sum + (parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0), 0);
  const taxAmount = items.reduce((sum, it) => {
    const base = (parseFloat(it.price) || 0) * (parseFloat(it.qty) || 0);
    return sum + base * (parseFloat(it.tax) || 0) / 100;
  }, 0);
  const total = subtotal + taxAmount;

  const handleSave = async (status = 'DRAFT') => {
    const validItems = items.filter(it => it.name && it.price);
    if (!validItems.length) return Alert.alert('Error', 'Add at least one item with name and price');
    setLoading(true);
    try {
      await api.createQuote(customerId, {
        items: validItems.map(it => ({ name: it.name, qty: parseFloat(it.qty), price: parseFloat(it.price), tax: parseFloat(it.tax) })),
        subtotal, taxAmount, total, notes,
        validTill: validTill || null, status,
      });
      Alert.alert('Success', `Quote ${status === 'SENT' ? 'sent' : 'saved'}!`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New quote for</Text>
        <Text style={styles.customerName}>{customerName}</Text>
      </View>

      {items.map((item, idx) => (
        <View key={item.id} style={styles.itemCard}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemLabel}>Item {idx + 1}</Text>
            {items.length > 1 && (
              <TouchableOpacity onPress={() => setItems(prev => prev.filter((_, i) => i !== idx))}>
                <Text style={{ color: colors.danger, fontSize: 12 }}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
          <Input label="Item name" value={item.name} onChangeText={v => updateItem(idx, 'name', v)} placeholder="Steel pipes 500 MT" />
          <View style={styles.row3}>
            <View style={{ flex: 1 }}>
              <Input label="Qty" value={item.qty} onChangeText={v => updateItem(idx, 'qty', v)} placeholder="1" keyboardType="numeric" />
            </View>
            <View style={{ flex: 2 }}>
              <Input label="Unit price (₹)" value={item.price} onChangeText={v => updateItem(idx, 'price', v)} placeholder="10000" keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Input label="GST %" value={item.tax} onChangeText={v => updateItem(idx, 'tax', v)} placeholder="18" keyboardType="numeric" />
            </View>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.addItem} onPress={() => setItems(prev => [...prev, defaultItem()])}>
        <Text style={styles.addItemText}>+ Add another item</Text>
      </TouchableOpacity>

      <View style={styles.totals}>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Subtotal</Text><Text style={styles.totalVal}>{formatCurrency(subtotal)}</Text></View>
        <View style={styles.totalRow}><Text style={styles.totalLabel}>Tax (GST)</Text><Text style={styles.totalVal}>{formatCurrency(taxAmount)}</Text></View>
        <View style={[styles.totalRow, styles.totalFinal]}><Text style={styles.totalLabelFinal}>Total</Text><Text style={styles.totalValFinal}>{formatCurrency(total)}</Text></View>
      </View>

      <View style={styles.extras}>
        <Input label="Notes" value={notes} onChangeText={setNotes} placeholder="Payment terms, delivery notes…" multiline />
        <Input label="Valid till" value={validTill} onChangeText={setValidTill} placeholder="YYYY-MM-DD" />
      </View>

      <View style={styles.actions}>
        <Button title="Save draft" onPress={() => handleSave('DRAFT')} variant="ghost" style={{ flex: 1 }} loading={loading} />
        <Button title="Send to customer" onPress={() => handleSave('SENT')} style={{ flex: 1 }} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  headerTitle: { fontSize: 13, color: colors.textMuted },
  customerName: { fontSize: 18, fontWeight: '700', color: colors.text },
  itemCard: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  itemLabel: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase' },
  row3: { flexDirection: 'row', gap: spacing.sm },
  addItem: { margin: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, borderStyle: 'dashed', alignItems: 'center' },
  addItemText: { color: colors.primary, fontWeight: '600', fontSize: 14 },
  totals: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm },
  totalFinal: { borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.md },
  totalLabel: { fontSize: 14, color: colors.textSecondary },
  totalVal: { fontSize: 14, color: colors.text },
  totalLabelFinal: { fontSize: 16, fontWeight: '700', color: colors.text },
  totalValFinal: { fontSize: 20, fontWeight: '700', color: colors.primary },
  extras: { margin: spacing.md, backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  actions: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
});

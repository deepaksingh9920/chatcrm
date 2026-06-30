import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { api } from '../../api/client';
import { Avatar } from '../../components/common/Avatar';
import { StatusBadge } from '../../components/common/StatusBadge';
import { colors, spacing, formatCurrency } from '../../utils/theme';

export const SearchScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  let timer;

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(timer);
    if (text.length < 2) { setResults(null); return; }
    timer = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await api.search(text);
        setResults(r);
      } catch {}
      finally { setLoading(false); }
    }, 350);
  };

  const total = results ? (results.customers?.length + results.quotes?.length + results.orders?.length + results.invoices?.length) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input} value={query} onChangeText={handleSearch} autoFocus
          placeholder="Search customers, quotes, orders, invoices…"
          placeholderTextColor={colors.textMuted}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>

      <FlatList
        data={[
          ...(results?.customers || []).map(c => ({ ...c, _type: 'customer' })),
          ...(results?.quotes || []).map(q => ({ ...q, _type: 'quote' })),
          ...(results?.orders || []).map(o => ({ ...o, _type: 'order' })),
          ...(results?.invoices || []).map(i => ({ ...i, _type: 'invoice' })),
        ]}
        keyExtractor={i => `${i._type}-${i.id}`}
        ListEmptyComponent={query.length > 1 && !loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{total === 0 ? 'No results found' : ''}</Text>
          </View>
        )}
        renderItem={({ item }) => {
          if (item._type === 'customer') return (
            <TouchableOpacity style={styles.result} onPress={() => navigation.navigate('Customers', { screen: 'Conversation', params: { customerId: item.id, customerName: item.name } })}>
              <Avatar name={item.name} size={36} />
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{item.name}</Text>
                <Text style={styles.resultMeta}>{item.phone || item.companyName || 'Customer'}</Text>
              </View>
              <Text style={styles.resultType}>Customer</Text>
            </TouchableOpacity>
          );
          return (
            <TouchableOpacity style={styles.result} onPress={() => navigation.navigate('Customers', { screen: 'Conversation', params: { customerId: item.customerId, customerName: item.customer?.name } })}>
              <View style={styles.docIcon}>
                <Text>{item._type === 'quote' ? '📄' : item._type === 'order' ? '📦' : '🧾'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.resultTitle}>{item.quoteNumber || item.orderNumber || item.invoiceNumber}</Text>
                <Text style={styles.resultMeta}>{item.customer?.name} · {formatCurrency(item.total)}</Text>
              </View>
              <StatusBadge status={item.status} />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, gap: spacing.sm },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 16, color: colors.text },
  result: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  resultTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  resultType: { fontSize: 11, color: colors.textMuted },
  docIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { color: colors.textMuted, fontSize: 14 },
});

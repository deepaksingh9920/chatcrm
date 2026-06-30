import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { api } from '../../api/client';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, formatTime } from '../../utils/theme';

export const CustomersScreen = ({ navigation }) => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q = '') => {
    try {
      const data = await api.getCustomers({ search: q, status: 'ACTIVE' });
      setCustomers(data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onSearch = (text) => { setSearch(text); load(text); };
  const onRefresh = async () => { setRefreshing(true); await load(search); setRefreshing(false); };

  const renderCustomer = ({ item }) => {
    const lastMsg = item.messages?.[0];
    const pendingTasks = item._count?.tasks || 0;
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Conversation', { customerId: item.id, customerName: item.name })}
      >
        <Avatar name={item.name} size={44} />
        <View style={styles.itemInfo}>
          <View style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            {lastMsg && <Text style={styles.itemTime}>{formatTime(lastMsg.createdAt)}</Text>}
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemPreview} numberOfLines={1}>
              {item.companyName || item.phone || item.email || 'No details'}
            </Text>
            {pendingTasks > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{pendingTasks}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, phone, GST…"
          value={search}
          onChangeText={onSearch}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      <FlatList
        data={customers}
        keyExtractor={i => i.id}
        renderItem={renderCustomer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={!loading && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No customers yet</Text>
            <Text style={styles.emptySubtext}>Tap + to add your first customer</Text>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('AddCustomer')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, margin: spacing.md, borderRadius: 10, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border },
  searchIcon: { fontSize: 14, marginRight: spacing.sm },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.text },
  item: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  itemInfo: { flex: 1, minWidth: 0 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.text },
  itemTime: { fontSize: 11, color: colors.textMuted },
  itemPreview: { fontSize: 13, color: colors.textMuted, flex: 1, marginRight: spacing.sm },
  badge: { backgroundColor: colors.primary, borderRadius: 999, minWidth: 18, height: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeText: { fontSize: 10, color: '#fff', fontWeight: '700' },
  empty: { padding: spacing.xxl, alignItems: 'center' },
  emptyText: { fontSize: 16, fontWeight: '600', color: colors.textSecondary },
  emptySubtext: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.lg, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4 },
  fabText: { fontSize: 28, color: '#fff', lineHeight: 32 },
});

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { colors, spacing, formatCurrency, formatTime } from '../../utils/theme';

const StatCard = ({ label, value, color = colors.text }) => (
  <View style={styles.statCard}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
  </View>
);

export const DashboardScreen = ({ navigation }) => {
  const { user, company, logout } = useAuth();
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api.dashboard();
      setData(d);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good day, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.companyName}>{company?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {data && (
        <>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Total customers" value={data.totalCustomers} />
            <StatCard label="Active conversations" value={data.activeConversations} color={colors.primary} />
            <StatCard label="Pending tasks" value={data.pendingTasks} color={data.pendingTasks > 0 ? colors.warning : colors.text} />
            <StatCard label="Pending quotes" value={data.pendingQuotes} color={colors.primary} />
            <StatCard label="Active orders" value={data.activeOrders} />
            <StatCard label="Monthly revenue" value={formatCurrency(data.monthRevenue)} color={colors.success} />
          </View>

          <View style={styles.outstandingCard}>
            <Text style={styles.outstandingLabel}>Outstanding payments</Text>
            <Text style={styles.outstandingValue}>{formatCurrency(data.outstandingPayments)}</Text>
          </View>

          <Text style={styles.sectionTitle}>Recent activity</Text>
          {data.recentActivities?.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.activityItem}
              onPress={() => navigation.navigate('Customers', { screen: 'Conversation', params: { customerId: item.customer.id, customerName: item.customer.name } })}
            >
              <View style={styles.activityDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityMeta}>{item.customer.name} · {formatTime(item.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </>
      )}

      {!data && (
        <View style={{ padding: spacing.xxl, alignItems: 'center' }}>
          <Text style={{ color: colors.textMuted }}>Loading dashboard…</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.lg, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  greeting: { fontSize: 18, fontWeight: '700', color: colors.text },
  companyName: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  logoutBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: 8, borderWidth: 1, borderColor: colors.border },
  logoutText: { fontSize: 13, color: colors.textSecondary },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, padding: spacing.lg, paddingBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: spacing.sm, gap: spacing.sm, paddingHorizontal: spacing.lg },
  statCard: { backgroundColor: colors.surface, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, width: '47%' },
  statLabel: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  statValue: { fontSize: 22, fontWeight: '700' },
  outstandingCard: { margin: spacing.lg, marginTop: 0, backgroundColor: colors.dangerLight, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: '#FECACA' },
  outstandingLabel: { fontSize: 13, color: colors.danger, marginBottom: 4 },
  outstandingValue: { fontSize: 28, fontWeight: '700', color: colors.danger },
  activityItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  activityDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 5 },
  activityTitle: { fontSize: 13, color: colors.text },
  activityMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

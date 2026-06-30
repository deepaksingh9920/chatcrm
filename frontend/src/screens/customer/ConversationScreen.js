import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { api } from '../../api/client';
import { Avatar } from '../../components/common/Avatar';
import { colors, spacing, formatTime } from '../../utils/theme';
import { useAuth } from '../../context/AuthContext';

const TABS = ['Chat', 'Quotes', 'Orders', 'Invoices', 'Tasks', 'Notes', 'Timeline'];

export const ConversationScreen = ({ route, navigation }) => {
  const { customerId, customerName } = route.params;
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Chat');
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [customer, setCustomer] = useState(null);
  const [tabData, setTabData] = useState({});
  const flatListRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({ title: customerName });
    loadCustomer();
    loadMessages();
  }, [customerId]);

  const loadCustomer = async () => {
    try {
      const c = await api.getCustomer(customerId);
      setCustomer(c);
    } catch (err) { console.error(err); }
  };

  const loadMessages = async () => {
    try {
      const msgs = await api.getMessages(customerId);
      setMessages(msgs);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    } catch (err) { console.error(err); }
  };

  const loadTab = useCallback(async (tab) => {
    if (tabData[tab]) return;
    try {
      let data;
      if (tab === 'Quotes') data = await api.getQuotes(customerId);
      else if (tab === 'Orders') data = await api.getOrders(customerId);
      else if (tab === 'Invoices') data = await api.getInvoices(customerId);
      else if (tab === 'Tasks') data = await api.getTasks(customerId);
      else if (tab === 'Notes') data = await api.getNotes(customerId);
      else if (tab === 'Timeline') data = await api.getTimeline(customerId);
      setTabData(p => ({ ...p, [tab]: data }));
    } catch (err) { console.error(err); }
  }, [customerId, tabData]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    loadTab(tab);
  };

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    try {
      const msg = await api.sendMessage(customerId, text);
      setMessages(prev => [...prev, msg]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (err) {
      Alert.alert('Error', 'Could not send message');
    }
  };

  const renderMessage = ({ item }) => {
    const isOut = item.direction === 'OUT';
    return (
      <View style={[styles.msgRow, isOut ? styles.msgRowOut : styles.msgRowIn]}>
        {!isOut && <Avatar name={customerName} size={28} />}
        <View style={[styles.bubble, isOut ? styles.bubbleOut : styles.bubbleIn]}>
          <Text style={[styles.bubbleText, isOut && styles.bubbleTextOut]}>{item.content}</Text>
          <Text style={[styles.bubbleTime, isOut && { color: 'rgba(255,255,255,0.7)' }]}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Tab bar */}
      <View style={styles.tabScrollContainer}>
        <FlatList
          horizontal data={TABS} keyExtractor={t => t}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.tab, activeTab === item && styles.tabActive]} onPress={() => handleTabChange(item)}>
              <Text style={[styles.tabText, activeTab === item && styles.tabTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Chat tab */}
      {activeTab === 'Chat' && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={m => m.id}
            renderItem={renderMessage}
            contentContainerStyle={styles.chatContent}
            ListEmptyComponent={<View style={{ padding: 40, alignItems: 'center' }}><Text style={{ color: colors.textMuted }}>No messages yet. Start the conversation!</Text></View>}
          />
          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('NewQuote', { customerId, customerName })}>
              <Text style={styles.quickActionText}>📄 Quote</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction} onPress={() => navigation.navigate('NewTask', { customerId, customerName })}>
              <Text style={styles.quickActionText}>✅ Task</Text>
            </TouchableOpacity>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type a message…"
                placeholderTextColor={colors.textMuted}
                multiline
                returnKeyType="send"
                onSubmitEditing={sendMessage}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={sendMessage}>
                <Text style={styles.sendIcon}>➤</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Other tabs */}
      {activeTab !== 'Chat' && (
        <TabContent tab={activeTab} data={tabData[activeTab]} customerId={customerId} customerName={customerName} navigation={navigation}
          onRefresh={() => { setTabData(p => ({ ...p, [activeTab]: null })); loadTab(activeTab); }}
        />
      )}
    </View>
  );
};

const TabContent = ({ tab, data, customerId, customerName, navigation, onRefresh }) => {
  if (!data) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: colors.textMuted }}>Loading…</Text></View>;

  if (tab === 'Tasks') return <TasksTab data={data} customerId={customerId} onRefresh={onRefresh} />;
  if (tab === 'Notes') return <NotesTab data={data} customerId={customerId} onRefresh={onRefresh} />;
  if (tab === 'Timeline') return <TimelineTab data={data} />;
  if (tab === 'Quotes') return <QuotesTab data={data} customerId={customerId} customerName={customerName} navigation={navigation} onRefresh={onRefresh} />;
  if (tab === 'Orders') return <OrdersTab data={data} customerId={customerId} onRefresh={onRefresh} />;
  if (tab === 'Invoices') return <InvoicesTab data={data} customerId={customerId} onRefresh={onRefresh} />;
  return null;
};

import { StatusBadge } from '../../components/common/StatusBadge';
import { formatCurrency, formatDate } from '../../utils/theme';

const QuotesTab = ({ data, customerId, customerName, navigation, onRefresh }) => (
  <View style={{ flex: 1, backgroundColor: colors.bg }}>
    <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('NewQuote', { customerId, customerName })}>
      <Text style={styles.addBtnText}>+ New quote</Text>
    </TouchableOpacity>
    <FlatList data={data} keyExtractor={i => i.id} renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.quoteNumber}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.cardAmount}>{formatCurrency(item.total)}</Text>
        <Text style={styles.cardMeta}>Valid till: {formatDate(item.validTill)}</Text>
        {item.status === 'DRAFT' && (
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.cardAction} onPress={async () => {
              try { await api.updateQuote(customerId, item.id, { status: 'SENT' }); onRefresh(); }
              catch (err) { Alert.alert('Error', err.message); }
            }}>
              <Text style={styles.cardActionText}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.cardAction, { backgroundColor: colors.successLight }]} onPress={async () => {
              try { await api.convertQuote(customerId, item.id); onRefresh(); Alert.alert('Success', 'Order created!'); }
              catch (err) { Alert.alert('Error', err.message); }
            }}>
              <Text style={[styles.cardActionText, { color: colors.success }]}>Convert to order →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    )} />
  </View>
);

const OrdersTab = ({ data, customerId, onRefresh }) => {
  const statuses = ['PENDING','PROCESSING','PACKED','SHIPPED','DELIVERED','CANCELLED'];
  return (
    <FlatList style={{ backgroundColor: colors.bg }} data={data} keyExtractor={i => i.id} renderItem={({ item }) => (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.orderNumber}</Text>
          <StatusBadge status={item.status} />
        </View>
        <Text style={styles.cardAmount}>{formatCurrency(item.total)}</Text>
        <Text style={styles.cardMeta}>{formatDate(item.createdAt)}</Text>
        <View style={styles.cardActions}>
          {statuses.map(s => s !== item.status && (
            <TouchableOpacity key={s} style={styles.cardAction} onPress={async () => {
              try { await api.updateOrder(customerId, item.id, { status: s }); onRefresh(); }
              catch (err) { Alert.alert('Error', err.message); }
            }}>
              <Text style={styles.cardActionText}>{s}</Text>
            </TouchableOpacity>
          )).filter(Boolean).slice(0, 2)}
          <TouchableOpacity style={[styles.cardAction, { backgroundColor: colors.primaryLight }]} onPress={async () => {
            try { await api.generateInvoice(customerId, item.id); Alert.alert('Success', 'Invoice generated!'); }
            catch (err) { Alert.alert('Error', err.message); }
          }}>
            <Text style={[styles.cardActionText, { color: colors.primary }]}>Generate invoice</Text>
          </TouchableOpacity>
        </View>
      </View>
    )} />
  );
};

const InvoicesTab = ({ data, customerId, onRefresh }) => (
  <FlatList style={{ backgroundColor: colors.bg }} data={data} keyExtractor={i => i.id} renderItem={({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.invoiceNumber}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.cardAmount}>{formatCurrency(item.total)}</Text>
      <Text style={styles.cardMeta}>Due: {formatDate(item.dueDate)}</Text>
      {item.status !== 'PAID' && (
        <TouchableOpacity style={[styles.cardAction, { backgroundColor: colors.successLight }]} onPress={async () => {
          try { await api.updateInvoice(customerId, item.id, { status: 'PAID', paidAmount: item.total }); onRefresh(); }
          catch (err) { Alert.alert('Error', err.message); }
        }}>
          <Text style={[styles.cardActionText, { color: colors.success }]}>Mark as paid ✓</Text>
        </TouchableOpacity>
      )}
    </View>
  )} />
);

const TasksTab = ({ data, customerId, onRefresh }) => {
  const [newTask, setNewTask] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.noteInput}>
        <TextInput style={styles.noteTextInput} value={newTask} onChangeText={setNewTask} placeholder="New task title…" placeholderTextColor={colors.textMuted} />
        <TouchableOpacity style={styles.noteSendBtn} onPress={async () => {
          if (!newTask.trim()) return;
          try { await api.createTask(customerId, { title: newTask.trim() }); setNewTask(''); onRefresh(); }
          catch (err) { Alert.alert('Error', err.message); }
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Add</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={data} keyExtractor={i => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={styles.taskItem} onPress={async () => {
          try { await api.updateTask(customerId, item.id, { status: item.status === 'PENDING' ? 'COMPLETED' : 'PENDING' }); onRefresh(); }
          catch (err) {}
        }}>
          <View style={[styles.taskCheck, item.status === 'COMPLETED' && styles.taskCheckDone]}>
            {item.status === 'COMPLETED' && <Text style={{ color: '#fff', fontSize: 10 }}>✓</Text>}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.taskTitle, item.status === 'COMPLETED' && styles.taskDone]}>{item.title}</Text>
            {item.dueDate && <Text style={styles.taskDue}>{formatDate(item.dueDate)}</Text>}
          </View>
        </TouchableOpacity>
      )} />
    </View>
  );
};

const NotesTab = ({ data, customerId, onRefresh }) => {
  const [note, setNote] = useState('');
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.noteInput}>
        <TextInput style={[styles.noteTextInput, { minHeight: 60 }]} value={note} onChangeText={setNote} placeholder="Add an internal note…" placeholderTextColor={colors.textMuted} multiline />
        <TouchableOpacity style={styles.noteSendBtn} onPress={async () => {
          if (!note.trim()) return;
          try { await api.createNote(customerId, note.trim()); setNote(''); onRefresh(); }
          catch (err) { Alert.alert('Error', err.message); }
        }}>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>Save</Text>
        </TouchableOpacity>
      </View>
      <FlatList data={data} keyExtractor={i => i.id} renderItem={({ item }) => (
        <View style={styles.noteItem}>
          <Text style={styles.noteText}>{item.content}</Text>
          <Text style={styles.noteMeta}>{item.user?.name} · {formatTime(item.createdAt)}</Text>
        </View>
      )} />
    </View>
  );
};

const TimelineTab = ({ data }) => (
  <FlatList
    style={{ backgroundColor: colors.bg, padding: spacing.md }}
    data={data}
    keyExtractor={i => i.id}
    renderItem={({ item }) => (
      <View style={styles.timelineItem}>
        <View style={styles.timelineDot} />
        <View style={{ flex: 1 }}>
          <Text style={styles.timelineTitle}>{item.title}</Text>
          <Text style={styles.timelineTime}>{formatTime(item.createdAt)}</Text>
        </View>
      </View>
    )}
  />
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  tabScrollContainer: { backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab: { paddingHorizontal: spacing.lg, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: colors.primary },
  tabText: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  tabTextActive: { color: colors.primary, fontWeight: '600' },
  chatContent: { padding: spacing.md, gap: spacing.md },
  msgRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end', marginBottom: spacing.sm },
  msgRowIn: { justifyContent: 'flex-start' },
  msgRowOut: { justifyContent: 'flex-end' },
  bubble: { maxWidth: '72%', padding: spacing.md, borderRadius: 16 },
  bubbleIn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderBottomLeftRadius: 4 },
  bubbleOut: { backgroundColor: colors.primary, borderBottomRightRadius: 4 },
  bubbleText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  bubbleTextOut: { color: '#fff' },
  bubbleTime: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  inputArea: { backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.sm },
  quickAction: { paddingHorizontal: spacing.sm, paddingVertical: 4, marginBottom: spacing.sm },
  quickActionText: { fontSize: 12, color: colors.primary, fontWeight: '500' },
  inputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  input: { flex: 1, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: spacing.md, paddingVertical: 8, fontSize: 14, color: colors.text, maxHeight: 80 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendIcon: { color: '#fff', fontSize: 14 },
  addBtn: { margin: spacing.md, backgroundColor: colors.primary, borderRadius: 8, padding: spacing.md, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  card: { backgroundColor: colors.surface, margin: spacing.md, marginTop: 0, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  cardTitle: { fontSize: 14, fontWeight: '600', color: colors.text },
  cardAmount: { fontSize: 20, fontWeight: '700', color: colors.text, marginBottom: 2 },
  cardMeta: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  cardActions: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  cardAction: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 6, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border },
  cardActionText: { fontSize: 12, fontWeight: '500', color: colors.textSecondary },
  noteInput: { flexDirection: 'row', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border },
  noteTextInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: spacing.sm, fontSize: 14, color: colors.text },
  noteSendBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, justifyContent: 'center' },
  noteItem: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  noteText: { fontSize: 14, color: colors.text, lineHeight: 20 },
  noteMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.surface },
  taskCheck: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  taskCheckDone: { backgroundColor: colors.success, borderColor: colors.success },
  taskTitle: { fontSize: 14, color: colors.text },
  taskDone: { textDecorationLine: 'line-through', color: colors.textMuted },
  taskDue: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  timelineItem: { flexDirection: 'row', gap: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  timelineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },
  timelineTitle: { fontSize: 13, color: colors.text },
  timelineTime: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Alert } from 'react-native';
import { api } from '../../api/client';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { colors, spacing } from '../../utils/theme';

export const NewTaskScreen = ({ route, navigation }) => {
  const { customerId } = route.params;
  const [form, setForm] = useState({ title: '', description: '', dueDate: '' });
  const [loading, setLoading] = useState(false);
  const set = (k) => (v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title) return Alert.alert('Error', 'Task title is required');
    setLoading(true);
    try {
      await api.createTask(customerId, { title: form.title, description: form.description, dueDate: form.dueDate || null });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err.message);
    } finally { setLoading(false); }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.section}>
        <Input label="Task title *" value={form.title} onChangeText={set('title')} placeholder="Follow-up call with Rajesh" />
        <Input label="Description" value={form.description} onChangeText={set('description')} placeholder="Optional details…" multiline />
        <Input label="Due date" value={form.dueDate} onChangeText={set('dueDate')} placeholder="YYYY-MM-DD" />
      </View>
      <View style={{ padding: spacing.lg }}>
        <Button title="Create task" onPress={handleSave} loading={loading} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  section: { backgroundColor: colors.surface, margin: spacing.md, borderRadius: 12, padding: spacing.lg, borderWidth: 1, borderColor: colors.border },
});

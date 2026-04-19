import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, CheckCircle, Circle, X, ArrowLeft, Kanban as KanbanIcon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useKanban, KanbanTask, TaskStatus } from '@/context/KanbanContext';

type TabType = 'todo' | 'in-progress' | 'done';

export default function PersonalKanbanScreen() {
  const router = useRouter();
  const { tasks, addTask, updateTask, deleteTask } = useKanban();
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addTask(newTaskTitle, activeTab);
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (task: KanbanTask) => {
    let nextStatus: TaskStatus = 'todo';
    if (task.status === 'todo') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'done';
    else if (task.status === 'done') nextStatus = 'todo';
    
    updateTask({ ...task, status: nextStatus });
  };

  const displayedTasks = tasks.filter(t => t.status === activeTab).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <LinearGradient colors={['#0B1220', '#0F172A']} style={styles.root}>
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={22} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.headerTitleRow}>
            <View style={styles.titleIconBox}>
              <KanbanIcon size={18} color="#3B82F6" />
            </View>
            <Text style={styles.headerTitle}>Personal Kanban</Text>
          </View>
          <View style={{ width: 44 }} />
        </View>

        {/* ── Tabs ── */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'todo' && styles.activeTab]}
            onPress={() => setActiveTab('todo')}
          >
            <Text style={[styles.tabText, activeTab === 'todo' && styles.activeTabText]}>What I am Doing</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'in-progress' && styles.activeTab]}
            onPress={() => setActiveTab('in-progress')}
          >
            <Text style={[styles.tabText, activeTab === 'in-progress' && styles.activeTabText]}>In Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'done' && styles.activeTab]}
            onPress={() => setActiveTab('done')}
          >
            <Text style={[styles.tabText, activeTab === 'done' && styles.activeTabText]}>Done</Text>
          </TouchableOpacity>
        </View>

        {/* ── Input ── */}
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a new personal task..."
              placeholderTextColor="#64748B"
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              onSubmitEditing={handleAddTask}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddTask}>
              <Plus size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* ── Task List ── */}
        <FlatList
          data={displayedTasks}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No personal tasks here.</Text>}
          renderItem={({ item }) => (
            <View style={styles.taskCard}>
              <TouchableOpacity onPress={() => toggleTaskStatus(item)} style={styles.statusCol}>
                {item.status === 'done' ? (
                  <CheckCircle size={24} color="#10B981" />
                ) : item.status === 'in-progress' ? (
                  <CheckCircle size={24} color="#F59E0B" />
                ) : (
                  <Circle size={24} color="#4B5563" />
                )}
              </TouchableOpacity>
              
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, item.status === 'done' && styles.taskDoneTitle]}>
                  {item.title}
                </Text>
                {item.roomId && (
                  <Text style={styles.importedBadge}>Imported from Squad</Text>
                )}
              </View>
              
              <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteTask(item.id)}>
                <X size={18} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: {
    width: 44, height: 44, justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  titleIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { color: '#E2E8F0', fontSize: 18, fontWeight: '700' },

  // Tabs
  tabRow: {
    flexDirection: 'row', marginHorizontal: 16, marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 14, padding: 5,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tabText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  activeTabText: { color: '#3B82F6' },

  // Input
  inputContainer: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 16, gap: 12,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14, color: '#E2E8F0', fontSize: 15,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  addBtn: {
    width: 52, height: 52, borderRadius: 14, backgroundColor: '#3B82F6',
    justifyContent: 'center', alignItems: 'center', shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },

  // List
  listContent: { padding: 16, paddingBottom: 100 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statusCol: { marginRight: 14 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#E2E8F0', fontSize: 15, fontWeight: '600', lineHeight: 22 },
  taskDoneTitle: { textDecorationLine: 'line-through', color: '#64748B' },
  importedBadge: { color: '#3B82F6', fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  deleteBtn: { padding: 6, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 60, fontSize: 14 },
});

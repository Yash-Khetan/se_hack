import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  FlatList, Modal, ScrollView,
} from 'react-native';
import { Plus, CheckCircle, Circle, UserPlus, MoreVertical, X } from 'lucide-react-native';
import { useSocket, SocketUser } from '@/context/SocketContext';
import { KanbanTask, TaskStatus } from '@/context/KanbanContext';

type TabType = 'todo' | 'in-progress' | 'done';

export default function KanbanPanel() {
  const { kanbanTasks, participants, currentUser, addKanbanTask, updateKanbanTask, deleteKanbanTask } = useSocket();
  const [activeTab, setActiveTab] = useState<TabType>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  
  // Modal state for assigning tasks
  const [assignModalTask, setAssignModalTask] = useState<KanbanTask | null>(null);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    addKanbanTask(newTaskTitle, 'todo');
    setNewTaskTitle('');
  };

  const toggleTaskStatus = (task: KanbanTask) => {
    let nextStatus: TaskStatus = 'todo';
    if (task.status === 'todo') nextStatus = 'in-progress';
    else if (task.status === 'in-progress') nextStatus = 'done';
    else if (task.status === 'done') nextStatus = 'todo';
    
    updateKanbanTask({ ...task, status: nextStatus });
  };

  const handleAssign = (userId: string | null) => {
    if (!assignModalTask) return;
    if (!userId) {
      updateKanbanTask({ ...assignModalTask, assigneeId: undefined, assigneeName: undefined });
    } else {
      const p = participants.find(part => part.id === userId);
      updateKanbanTask({ ...assignModalTask, assigneeId: userId, assigneeName: p?.name });
    }
    setAssignModalTask(null);
  };

  // Filter tasks by active tab
  const displayedTasks = kanbanTasks.filter(t => t.status === activeTab).sort((a, b) => b.createdAt - a.createdAt);

  return (
    <View style={styles.container}>
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
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="New task..."
          placeholderTextColor="#64748B"
          value={newTaskTitle}
          onChangeText={setNewTaskTitle}
          onSubmitEditing={handleAddTask}
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddTask}>
          <Plus size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── Task List ── */}
      <FlatList
        data={displayedTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<Text style={styles.emptyText}>No tasks in this column.</Text>}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <TouchableOpacity onPress={() => toggleTaskStatus(item)} style={styles.statusCol}>
              {item.status === 'done' ? (
                <CheckCircle size={22} color="#10B981" />
              ) : item.status === 'in-progress' ? (
                <CheckCircle size={22} color="#F59E0B" />
              ) : (
                <Circle size={22} color="#4B5563" />
              )}
            </TouchableOpacity>
            
            <View style={styles.taskInfo}>
              <Text style={[styles.taskTitle, item.status === 'done' && styles.taskDoneTitle]}>
                {item.title}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.assignBadge}
              onPress={() => setAssignModalTask(item)}
            >
              <UserPlus size={14} color="#3B82F6" />
              <Text style={styles.assignText} numberOfLines={1}>
                {item.assigneeName ? item.assigneeName.split(' ')[0] : 'Assign'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteKanbanTask(item.id)}>
              <X size={16} color="#EF4444" />
            </TouchableOpacity>
          </View>
        )}
      />

      {/* ── Assignee Modal ── */}
      <Modal visible={!!assignModalTask} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Assign to Participant</Text>
            <ScrollView style={styles.modalList}>
              <TouchableOpacity style={styles.modalRow} onPress={() => handleAssign(null)}>
                <View style={[styles.avatar, { backgroundColor: '#333' }]} />
                <Text style={styles.modalRowText}>Unassigned</Text>
              </TouchableOpacity>
              {participants.map(p => (
                <TouchableOpacity key={p.id} style={styles.modalRow} onPress={() => handleAssign(p.id)}>
                  <View style={[styles.avatar, { backgroundColor: `${p.color}20` }]}>
                    <Text style={[styles.avatarText, { color: p.color }]}>{p.initials}</Text>
                  </View>
                  <Text style={styles.modalRowText}>{p.name} {p.id === currentUser?.id ? '(You)' : ''}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setAssignModalTask(null)}>
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  // Tabs
  tabRow: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8,
  },
  activeTab: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tabText: { color: '#64748B', fontSize: 11, fontWeight: '600' },
  activeTabText: { color: '#3B82F6' },
  // Input
  inputContainer: {
    flexDirection: 'row', paddingHorizontal: 16, marginTop: 12, gap: 10,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    color: '#E2E8F0', fontSize: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  addBtn: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: '#3B82F6',
    justifyContent: 'center', alignItems: 'center',
  },
  // List
  listContent: { padding: 16, paddingBottom: 60 },
  taskCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  statusCol: { marginRight: 12 },
  taskInfo: { flex: 1 },
  taskTitle: { color: '#E2E8F0', fontSize: 14, fontWeight: '600' },
  taskDoneTitle: { textDecorationLine: 'line-through', color: '#64748B' },
  assignBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
    marginRight: 8,
  },
  assignText: { color: '#3B82F6', fontSize: 11, fontWeight: '600', maxWidth: 60 },
  deleteBtn: { padding: 4 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 40, fontSize: 13 },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
  modalBox: { backgroundColor: '#1E293B', borderRadius: 16, padding: 20, maxHeight: 400 },
  modalTitle: { color: '#E2E8F0', fontSize: 16, fontWeight: '700', marginBottom: 16, textAlign: 'center' },
  modalList: { flexGrow: 0 },
  modalRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 12, fontWeight: '700' },
  modalRowText: { color: '#E2E8F0', fontSize: 14, fontWeight: '500' },
  modalCloseBtn: { marginTop: 20, alignItems: 'center', padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12 },
  modalCloseText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
});

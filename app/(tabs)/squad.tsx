import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,
  FlatList, Modal, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  MessageSquare, Video, Mic, Pencil, LayoutGrid, Send, X, Plus, Copy,
  UserPlus, Users as UsersIcon,
} from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import TouchableScale from '@/components/Shared/TouchableScale';
import Colors from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// --- Mock Data ---
const members = [
  { id: '1', name: 'Aarav', status: 'online' },
  { id: '2', name: 'Renee', status: 'online' },
  { id: '3', name: 'Sanjay', status: 'away' },
  { id: '4', name: 'Priya', status: 'online' },
];

const chatMessages = [
  { id: '1', user: 'Aarav', text: 'Has anyone solved Q4 from the DSA sheet?', time: '4:20 PM' },
  { id: '2', user: 'Renee', text: 'Yes! Use a modified BFS approach. I dropped it on the whiteboard.', time: '4:22 PM' },
  { id: '3', user: 'Priya', text: 'Can someone update the Kanban? I finished the intro section.', time: '4:25 PM' },
];

const kanbanData = {
  todo: [
    { id: '1', title: 'Literature Review', assignee: 'Sanjay' },
    { id: '2', title: 'Data Collection', assignee: 'Priya' },
  ],
  doing: [
    { id: '3', title: 'Algorithm Design', assignee: 'Aarav' },
    { id: '4', title: 'Write Introduction', assignee: 'Renee' },
  ],
  done: [
    { id: '5', title: 'Problem Statement', assignee: 'Renee' },
    { id: '6', title: 'Set up repo', assignee: 'Aarav' },
  ],
};

type TabType = 'chat' | 'kanban';

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const bottomOffset = insets.bottom + 60;

  const [activeTab, setActiveTab] = useState<TabType>('chat');
  const [chatInput, setChatInput] = useState('');
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Squad</Text>
            <Text style={styles.squadName}>🔗 Physics Study Group · 4 members</Text>
          </View>
          <TouchableOpacity style={styles.joinBtn} onPress={() => setShowJoin(true)}>
            <UserPlus size={18} color={Colors.theme.accent} />
          </TouchableOpacity>
        </View>

        {/* Members Strip */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.memberStrip}>
          {members.map((m) => (
            <View key={m.id} style={styles.memberChip}>
              <View style={[styles.memberDot, { backgroundColor: m.status === 'online' ? Colors.theme.success : Colors.theme.warning }]} />
              <Text style={styles.memberName}>{m.name}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Tab Switcher */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'chat' && styles.tabActive]}
            onPress={() => setActiveTab('chat')}
          >
            <MessageSquare size={16} color={activeTab === 'chat' ? Colors.theme.accent : Colors.theme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'chat' && styles.tabTextActive]}>Discussion</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'kanban' && styles.tabActive]}
            onPress={() => setActiveTab('kanban')}
          >
            <LayoutGrid size={16} color={activeTab === 'kanban' ? Colors.theme.accent : Colors.theme.textMuted} />
            <Text style={[styles.tabText, activeTab === 'kanban' && styles.tabTextActive]}>Kanban</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'chat' ? (
          <View style={styles.chatContainer}>
            <ScrollView style={styles.chatScroll} contentContainerStyle={styles.chatContent}>
              {chatMessages.map((msg) => (
                <View key={msg.id} style={styles.chatBubble}>
                  <View style={styles.chatBubbleHeader}>
                    <Text style={styles.chatUser}>{msg.user}</Text>
                    <Text style={styles.chatTime}>{msg.time}</Text>
                  </View>
                  <Text style={styles.chatText}>{msg.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Chat Actions */}
            <View style={styles.chatActions}>
              <TouchableOpacity style={styles.actionIcon}>
                <Mic size={20} color={Colors.theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon}>
                <Video size={20} color={Colors.theme.textMuted} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIcon} onPress={() => setShowWhiteboard(true)}>
                <Pencil size={20} color={Colors.theme.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Chat Input */}
            <View style={[styles.inputRow, { paddingBottom: bottomOffset }]}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                placeholderTextColor={Colors.theme.textMuted}
                value={chatInput}
                onChangeText={setChatInput}
              />
              <TouchableOpacity style={styles.sendBtn}>
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.kanbanContainer, { paddingBottom: bottomOffset + 20 }]}>
            {/* To Do */}
            <View style={styles.kanbanColumn}>
              <View style={[styles.kanbanHeader, { borderBottomColor: Colors.theme.textMuted }]}>
                <Text style={styles.kanbanTitle}>📋 To Do</Text>
                <Text style={styles.kanbanCount}>{kanbanData.todo.length}</Text>
              </View>
              {kanbanData.todo.map((item) => (
                <View key={item.id} style={styles.kanbanCard}>
                  <Text style={styles.kanbanCardTitle}>{item.title}</Text>
                  <Text style={styles.kanbanCardAssignee}>{item.assignee}</Text>
                </View>
              ))}
            </View>

            {/* Doing */}
            <View style={styles.kanbanColumn}>
              <View style={[styles.kanbanHeader, { borderBottomColor: Colors.theme.accent }]}>
                <Text style={styles.kanbanTitle}>🔨 Doing</Text>
                <Text style={styles.kanbanCount}>{kanbanData.doing.length}</Text>
              </View>
              {kanbanData.doing.map((item) => (
                <View key={item.id} style={styles.kanbanCard}>
                  <Text style={styles.kanbanCardTitle}>{item.title}</Text>
                  <Text style={styles.kanbanCardAssignee}>{item.assignee}</Text>
                </View>
              ))}
            </View>

            {/* Done */}
            <View style={styles.kanbanColumn}>
              <View style={[styles.kanbanHeader, { borderBottomColor: Colors.theme.success }]}>
                <Text style={styles.kanbanTitle}>✅ Done</Text>
                <Text style={styles.kanbanCount}>{kanbanData.done.length}</Text>
              </View>
              {kanbanData.done.map((item) => (
                <View key={item.id} style={[styles.kanbanCard, { borderLeftColor: Colors.theme.success }]}>
                  <Text style={[styles.kanbanCardTitle, { textDecorationLine: 'line-through', opacity: 0.6 }]}>{item.title}</Text>
                  <Text style={styles.kanbanCardAssignee}>{item.assignee}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Whiteboard Bottom Sheet */}
        <Modal visible={showWhiteboard} transparent animationType="slide">
          <View style={styles.sheetOverlay}>
            <TouchableOpacity style={styles.sheetBackdrop} onPress={() => setShowWhiteboard(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>📝 Whiteboard</Text>
                <TouchableOpacity onPress={() => setShowWhiteboard(false)}>
                  <X size={22} color={Colors.theme.textMuted} />
                </TouchableOpacity>
              </View>
              <View style={styles.whiteboardArea}>
                <Text style={styles.whiteboardPlaceholder}>
                  Shared canvas — sketch, paste code snippets, or draw diagrams here.{'\n\n'}
                  All changes sync live with your squad.
                </Text>
              </View>
            </View>
          </View>
        </Modal>

        {/* Join Squad Modal */}
        <Modal visible={showJoin} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Join or Create Squad</Text>
              <TextInput style={styles.modalInput} placeholder="Enter squad code..." placeholderTextColor={Colors.theme.textMuted} />
              <TouchableOpacity style={styles.modalBtn}>
                <Text style={styles.modalBtnText}>Join Squad</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.theme.border }]}>
                <Text style={[styles.modalBtnText, { color: Colors.theme.accent }]}>Create New Squad</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowJoin(false)} style={{ marginTop: 12 }}>
                <Text style={{ color: Colors.theme.textMuted, textAlign: 'center' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 8 },
  title: { color: Colors.theme.text, fontSize: 28, fontWeight: '700' },
  squadName: { color: Colors.theme.textMuted, fontSize: 13, marginTop: 4 },
  joinBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(59,130,246,0.12)',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
  },
  // Members
  memberStrip: { paddingHorizontal: 20, paddingVertical: 10, gap: 8 },
  memberChip: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.theme.cardSolid,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6,
    borderWidth: 1, borderColor: Colors.theme.border,
  },
  memberDot: { width: 8, height: 8, borderRadius: 4 },
  memberName: { color: Colors.theme.text, fontSize: 13, fontWeight: '500' },
  // Tabs
  tabRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 12, backgroundColor: Colors.theme.cardSolid, borderRadius: 14, padding: 4 },
  tab: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 10, borderRadius: 12, gap: 6 },
  tabActive: { backgroundColor: 'rgba(59,130,246,0.12)' },
  tabText: { color: Colors.theme.textMuted, fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: Colors.theme.accent },
  // Chat
  chatContainer: { flex: 1 },
  chatScroll: { flex: 1, paddingHorizontal: 20 },
  chatContent: { paddingBottom: 12 },
  chatBubble: {
    backgroundColor: Colors.theme.cardSolid, borderRadius: 16, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.theme.border,
  },
  chatBubbleHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  chatUser: { color: Colors.theme.accent, fontSize: 13, fontWeight: '700' },
  chatTime: { color: Colors.theme.textMuted, fontSize: 11 },
  chatText: { color: Colors.theme.text, fontSize: 14, lineHeight: 21 },
  chatActions: {
    flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 8,
    borderTopWidth: 1, borderTopColor: Colors.theme.border,
  },
  actionIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', padding: 12, paddingHorizontal: 16,
    backgroundColor: Colors.theme.cardSolid, borderTopWidth: 1, borderTopColor: Colors.theme.border,
  },
  input: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10, color: Colors.theme.text, fontSize: 14,
    marginRight: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21, backgroundColor: Colors.theme.accent,
    justifyContent: 'center', alignItems: 'center',
  },
  // Kanban
  kanbanContainer: { paddingHorizontal: 16, paddingBottom: 100, gap: 12 },
  kanbanColumn: { width: 220, backgroundColor: Colors.theme.cardSolid, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: Colors.theme.border },
  kanbanHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 8, borderBottomWidth: 2 },
  kanbanTitle: { color: Colors.theme.text, fontSize: 15, fontWeight: '700' },
  kanbanCount: { color: Colors.theme.textMuted, fontSize: 12, backgroundColor: 'rgba(255,255,255,0.06)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  kanbanCard: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 12, marginBottom: 8,
    borderLeftWidth: 3, borderLeftColor: Colors.theme.accent,
  },
  kanbanCardTitle: { color: Colors.theme.text, fontSize: 14, fontWeight: '500', marginBottom: 4 },
  kanbanCardAssignee: { color: Colors.theme.textMuted, fontSize: 12 },
  // Whiteboard Sheet
  sheetOverlay: { flex: 1, justifyContent: 'flex-end' },
  sheetBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { backgroundColor: Colors.theme.cardSolid, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, minHeight: SCREEN_HEIGHT * 0.5 },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'center', marginBottom: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sheetTitle: { color: Colors.theme.text, fontSize: 20, fontWeight: '700' },
  whiteboardArea: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 16, padding: 24,
    minHeight: 200, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: Colors.theme.border, borderStyle: 'dashed',
  },
  whiteboardPlaceholder: { color: Colors.theme.textMuted, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  // Join Modal
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  modalContent: { backgroundColor: Colors.theme.cardSolid, borderRadius: 24, padding: 28, width: '85%', borderWidth: 1, borderColor: Colors.theme.border },
  modalTitle: { color: Colors.theme.text, fontSize: 22, fontWeight: '700', marginBottom: 20, textAlign: 'center' },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    color: Colors.theme.text, fontSize: 16, marginBottom: 16, borderWidth: 1, borderColor: Colors.theme.border,
  },
  modalBtn: {
    backgroundColor: Colors.theme.accent, paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginBottom: 10,
  },
  modalBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

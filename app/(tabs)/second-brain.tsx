import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Paperclip, Cpu, Shield, ChevronDown } from 'lucide-react-native';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

const subjects = ['All Subjects', 'Physics', 'DSA', 'Math', 'Electronics'];

const initialMessages = [
  { id: '1', type: 'bot', text: "Hi! I'm your Second Brain 🧠. Ask me anything from your uploaded notes and textbooks. Everything stays on-device — fully private.", timestamp: '5:30 PM' },
  { id: '2', type: 'user', text: "Explain binary search trees in simple terms", timestamp: '5:31 PM' },
  { id: '3', type: 'bot', text: "A Binary Search Tree (BST) is a tree data structure where:\n\n• Each node has at most 2 children\n• Left child < Parent < Right child\n• This property holds for every subtree\n\nThis makes searching O(log n) on average — like finding a word in a dictionary by halving pages!\n\n📖 Source: DSA_Textbook.pdf, Chapter 8", timestamp: '5:31 PM' },
];

export default function SecondBrainScreen() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;
  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT;

  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showFilter, setShowFilter] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      const botMsg = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: "I'm searching your local notes for relevant content... This feature uses on-device RAG with TensorFlow.js for complete privacy. 🔒",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={bottomOffset}
        >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Second Brain</Text>
            <View style={styles.privacyBadge}>
              <Shield size={12} color={Colors.theme.success} />
              <Text style={styles.privacyText}>Local-first · Offline RAG</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(!showFilter)}>
            <Text style={styles.filterBtnText}>{selectedSubject}</Text>
            <ChevronDown size={16} color={Colors.theme.accent} />
          </TouchableOpacity>
        </View>

        {/* Subject Filter Dropdown */}
        {showFilter && (
          <View style={styles.dropdown}>
            {subjects.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.dropdownItem, selectedSubject === s && styles.dropdownItemActive]}
                onPress={() => { setSelectedSubject(s); setShowFilter(false); }}
              >
                <Text style={[styles.dropdownText, selectedSubject === s && { color: Colors.theme.accent }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Chat Area */}
        <ScrollView
          ref={scrollRef}
          style={styles.chatArea}
          contentContainerStyle={[styles.chatContent, { paddingBottom: bottomOffset + 12 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.bubble, msg.type === 'user' ? styles.userBubble : styles.botBubble]}>
              {msg.type === 'bot' && (
                <View style={styles.botIcon}>
                  <Cpu size={14} color={Colors.theme.accentSecondary} />
                </View>
              )}
              <View style={styles.bubbleContent}>
                <Text style={styles.bubbleText}>{msg.text}</Text>
                <Text style={styles.timestamp}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputArea, { paddingBottom: Math.max(bottomOffset, 16) }]}>
          <TouchableOpacity style={styles.attachBtn}>
            <Paperclip size={20} color={Colors.theme.textMuted} />
          </TouchableOpacity>
          <TextInput
            style={styles.input}
            placeholder="Ask your notes..."
            placeholderTextColor={Colors.theme.textMuted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: 20, paddingBottom: 12 },
  title: { color: Colors.theme.text, fontSize: 28, fontWeight: '700' },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  privacyText: { color: Colors.theme.success, fontSize: 11, fontWeight: '600' },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(59,130,246,0.12)', paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
  },
  filterBtnText: { color: Colors.theme.accent, fontSize: 13, fontWeight: '600' },
  // Dropdown
  dropdown: {
    marginHorizontal: 20, backgroundColor: Colors.theme.cardSolid, borderRadius: 12,
    borderWidth: 1, borderColor: Colors.theme.border, marginBottom: 8, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  dropdownItemActive: { backgroundColor: 'rgba(59,130,246,0.08)' },
  dropdownText: { color: Colors.theme.text, fontSize: 14 },
  // Chat
  chatArea: { flex: 1, paddingHorizontal: 20 },
  chatContent: { paddingBottom: 12 },
  bubble: { marginBottom: 12, maxWidth: '85%' },
  userBubble: { alignSelf: 'flex-end' },
  botBubble: { alignSelf: 'flex-start', flexDirection: 'row', gap: 8 },
  botIcon: {
    width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(34,211,238,0.15)',
    justifyContent: 'center', alignItems: 'center', marginTop: 4,
  },
  bubbleContent: {
    backgroundColor: Colors.theme.cardSolid, borderRadius: 18, padding: 14,
    borderWidth: 1, borderColor: Colors.theme.border, flex: 1,
  },
  bubbleText: { color: Colors.theme.text, fontSize: 14, lineHeight: 22 },
  timestamp: { color: Colors.theme.textMuted, fontSize: 10, marginTop: 6, textAlign: 'right' },
  // Input
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: Colors.theme.cardSolid,
    borderTopWidth: 1,
    borderTopColor: Colors.theme.border,
    gap: 8,
  },
  attachBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: Colors.theme.text,
    fontSize: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 40,
    maxHeight: 100,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
});

import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Paperclip, Cpu, Shield, ChevronDown, FileText, X } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

const subjects = ['All Subjects', 'Physics', 'DSA', 'Math', 'Electronics'];

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  timestamp: string;
  attachment?: { name: string; size?: number; mimeType?: string };
}

const initialMessages: Message[] = [
  {
    id: '1', type: 'bot',
    text: "Hi! I'm your Second Brain 🧠. Ask me anything from your uploaded notes and textbooks. Tap 📎 to upload a PDF, doc, or text file — everything stays on-device via local RAG.",
    timestamp: '5:30 PM',
  },
  {
    id: '2', type: 'user',
    text: 'Explain binary search trees in simple terms',
    timestamp: '5:31 PM',
  },
  {
    id: '3', type: 'bot',
    text: 'A Binary Search Tree (BST) is a tree data structure where:\n\n• Each node has at most 2 children\n• Left child < Parent < Right child\n• This property holds for every subtree\n\nThis makes searching O(log n) on average — like finding a word in a dictionary by halving pages!\n\n📖 Source: DSA_Textbook.pdf, Chapter 8',
    timestamp: '5:31 PM',
  },
];

function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function SecondBrainScreen() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 60;
  const bottomOffset = insets.bottom + TAB_BAR_HEIGHT;

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showFilter, setShowFilter] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ name: string; size?: number; mimeType?: string; uri: string } | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const asset = result.assets[0];
      setPendingFile({
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType ?? undefined,
        uri: asset.uri,
      });
    } catch (e) {
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  const handleSend = () => {
    const hasText = inputText.trim().length > 0;
    const hasFile = !!pendingFile;
    if (!hasText && !hasFile) return;

    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim() || (hasFile ? `Uploaded: ${pendingFile!.name}` : ''),
      timestamp: ts,
      attachment: hasFile ? pendingFile! : undefined,
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setPendingFile(null);

    // Simulate RAG bot response
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: hasFile
          ? `📂 Indexing **${userMsg.attachment?.name}** into your local RAG pipeline...\n\nThe file will be chunked, embedded, and stored on-device. You can then ask questions about its content. 🔒 Everything stays private.`
          : "Searching your local notes for relevant content... This uses on-device RAG with TensorFlow.js for complete privacy. 🔒",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 1200);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? bottomOffset + 4 : 4}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Second Brain</Text>
              <View style={styles.privacyBadge}>
                <Shield size={11} color={Colors.theme.success} />
                <Text style={styles.privacyText}>Local-first · Offline RAG</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(!showFilter)}>
              <Text style={styles.filterBtnText}>{selectedSubject}</Text>
              <ChevronDown size={14} color={Colors.theme.accent} />
            </TouchableOpacity>
          </View>

          {/* ── Subject Filter Dropdown ── */}
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

          {/* ── Chat Messages ── */}
          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => {
              const isUser = msg.type === 'user';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.bubbleRow,
                    isUser ? styles.bubbleRowRight : styles.bubbleRowLeft,
                  ]}
                >
                  {/* Bot avatar — only on left side */}
                  {!isUser && (
                    <View style={styles.botIcon}>
                      <Cpu size={13} color={Colors.theme.accentSecondary} />
                    </View>
                  )}

                  {/* Bubble — shrinks to content, never stretches */}
                  <View style={[
                    styles.bubbleContent,
                    isUser ? styles.userBubbleContent : styles.botBubbleContent,
                  ]}>
                    {/* File attachment badge inside bubble */}
                    {msg.attachment && (
                      <View style={styles.attachmentBadge}>
                        <FileText size={12} color={Colors.theme.accent} />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {msg.attachment.name}
                        </Text>
                        {msg.attachment.size && (
                          <Text style={styles.attachmentSize}>
                            {formatFileSize(msg.attachment.size)}
                          </Text>
                        )}
                      </View>
                    )}
                    <Text style={[styles.bubbleText, isUser && styles.userBubbleText]}>
                      {msg.text}
                    </Text>
                    <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
                      {msg.timestamp}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* ── Pending file preview ── */}
          {pendingFile && (
            <View style={styles.pendingFileBar}>
              <FileText size={14} color={Colors.theme.accent} />
              <Text style={styles.pendingFileName} numberOfLines={1}>{pendingFile.name}</Text>
              {pendingFile.size && (
                <Text style={styles.pendingFileSize}>{formatFileSize(pendingFile.size)}</Text>
              )}
              <TouchableOpacity onPress={() => setPendingFile(null)} style={styles.pendingRemoveBtn}>
                <X size={14} color={Colors.theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          {/* ── Input Bar ── */}
          <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) + 48 }]}>
            <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile} activeOpacity={0.7}>
              <Paperclip size={19} color={pendingFile ? Colors.theme.accent : Colors.theme.textMuted} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder="Ask your notes..."
              placeholderTextColor={Colors.theme.textMuted}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              multiline
              textAlignVertical="center"
              blurOnSubmit={false}
            />

            <TouchableOpacity
              style={[styles.sendBtn, !(inputText.trim() || pendingFile) && styles.sendBtnDisabled]}
              onPress={handleSend}
              activeOpacity={0.8}
              disabled={!(inputText.trim() || pendingFile)}
            >
              <Send size={17} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  // Header — tighter
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8,
  },
  title: { color: Colors.theme.text, fontSize: 24, fontWeight: '700' },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  privacyText: { color: Colors.theme.success, fontSize: 10, fontWeight: '600' },
  filterBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)',
  },
  filterBtnText: { color: Colors.theme.accent, fontSize: 12, fontWeight: '600' },

  // Dropdown
  dropdown: {
    marginHorizontal: 18, backgroundColor: Colors.theme.cardSolid,
    borderRadius: 12, borderWidth: 1, borderColor: Colors.theme.border,
    marginBottom: 6, overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  dropdownItemActive: { backgroundColor: 'rgba(59,130,246,0.08)' },
  dropdownText: { color: Colors.theme.text, fontSize: 13 },

  // Chat area
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },

  // Message rows
  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 12,
    maxWidth: '85%',
  },
  bubbleRowLeft: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    gap: 8,
  },
  bubbleRowRight: {
    alignSelf: 'flex-end',
  },

  // Bot icon
  botIcon: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(34,211,238,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 4, flexShrink: 0,
  },

  // Bubble content
  bubbleContent: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  botBubbleContent: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderBottomLeftRadius: 4,
  },
  userBubbleContent: {
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    color: Colors.theme.text,
    fontSize: 14,
    lineHeight: 21,
    letterSpacing: 0.2,
  },
  userBubbleText: {
    color: '#F8FAFC',
  },
  timestamp: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    marginTop: 6,
    textAlign: 'right',
  },
  userTimestamp: {
    color: 'rgba(255,255,255,0.4)',
  },

  // Attachment badge
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  attachmentName: {
    flex: 1,
    color: Colors.theme.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentSize: {
    color: Colors.theme.textMuted,
    fontSize: 10,
  },

  // Pending file preview pulse
  pendingFileBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  pendingFileName: {
    flex: 1,
    color: Colors.theme.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  pendingFileSize: {
    color: Colors.theme.textMuted,
    fontSize: 11,
  },
  pendingRemoveBtn: {
    padding: 2,
  },

  // Input area
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    backgroundColor: '#0F172A',
    gap: 10,
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.04)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    flexShrink: 0,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    color: Colors.theme.text,
    fontSize: 15,
    lineHeight: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    minHeight: 44,
    maxHeight: 140,
    textAlignVertical: 'center',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
    marginBottom: 2,
    shadowColor: Colors.theme.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
  },
  sendBtnDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    shadowOpacity: 0,
    elevation: 0,
  },
});

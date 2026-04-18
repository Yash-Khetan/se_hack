import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Send, Paperclip, Cpu, Shield, ChevronDown, FileText, X, Cloud } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import GradientBackground from '@/components/Shared/GradientBackground';
import Colors from '@/constants/Colors';

const RAG_BASE_URL = 'https://rag-qlv2.onrender.com';
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
    text: "Hi! I'm your Second Brain 🧠. Your personal RAG pipeline is active. Please upload a PDF to index it first, then you can ask me questions about it.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
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
  const [isTyping, setIsTyping] = useState(false);
  
  // Track the document ID from the backend
  const [documentId, setDocumentId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);

  const handlePickFile = async () => {
    console.log('📂 [RAG] Opening document picker...');
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) {
        console.log('📂 [RAG] Document picking cancelled.');
        return;
      }

      const asset = result.assets[0];
      console.log('📂 [RAG] File selected:', asset.name, `(${asset.size} bytes)`);
      setPendingFile({
        name: asset.name,
        size: asset.size,
        mimeType: asset.mimeType ?? 'application/pdf',
        uri: asset.uri,
      });
    } catch (e) {
      console.error('❌ [RAG] Picker Error:', e);
      Alert.alert('Error', 'Could not open file picker.');
    }
  };

  const addMessage = (text: string, type: 'bot' | 'user', attachment?: Message['attachment']) => {
    const ts = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg: Message = {
      id: Date.now().toString() + Math.random(),
      type,
      text,
      timestamp: ts,
      attachment,
    };
    setMessages(prev => [...prev, newMsg]);
    return newMsg;
  };

  const handleSend = async () => {
    const text = inputText.trim();
    const file = pendingFile;
    if (!text && !file) return;

    // Clear UI state
    setInputText('');
    setPendingFile(null);

    // Add user message to UI
    addMessage(text || `Uploaded: ${file?.name}`, 'user', file ? { name: file.name, size: file.size, mimeType: file.mimeType } : undefined);
    
    setIsTyping(true);
    console.log('🚀 [RAG] Starting multi-step process...');

    try {
      let currentDocId = documentId;

      // 1. FILE UPLOAD STEP
      if (file) {
        console.log('📁 [RAG] Processing File Upload...');
        const formData = new FormData();
        
        // Remove 'file://' prefix on iOS which can frequently break file fetching for FormData
        const fileUri = Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;
        
        // @ts-ignore - Expo/React Native FormData compatibility
        formData.append('file', {
          uri: fileUri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
        } as any);

        console.log(`📤 [RAG] POSTing to ${RAG_BASE_URL}/api/upload...`);
        const uploadRes = await fetch(`${RAG_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json',
          },
        });

        // Safe JSON parsing for the upload response in case of 500 HTML errors
        let uploadData: any = {};
        const contentType = uploadRes.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          uploadData = await uploadRes.json();
        } else {
          const rawText = await uploadRes.text();
          console.warn('⚠️ [RAG] Non-JSON Upload Response:', rawText.substring(0, 100));
          throw new Error(`Server returned non-JSON response (${uploadRes.status}). ${rawText.substring(0, 50)}...`);
        }

        console.log(`📡 [RAG] Upload Status: ${uploadRes.status} | Response:`, uploadData);

        if (uploadRes.ok && uploadData.documentId) {
          setDocumentId(uploadData.documentId);
          currentDocId = uploadData.documentId;
          console.log(`✅ [RAG] Document Indexed. ID: ${uploadData.documentId}`);
          addMessage(`📂 Successfully indexed **${file.name}**. Chunks: ${uploadData.chunksCount || 'N/A'}.`, 'bot');
        } else {
          throw new Error(uploadData.message || uploadData.error || `Upload failed with status: ${uploadRes.status}`);
        }
      }

      // 2. QUERY STEP
      if (text) {
        if (!currentDocId) {
          console.warn('⚠️ [RAG] Query attempted but no document is indexed yet.');
          addMessage("⚠️ Please upload a PDF first so I have something to search from!", 'bot');
          setIsTyping(false);
          return;
        }

        console.log(`🧠 [RAG] Querying Document ID: ${currentDocId}`);
        console.log(`💬 [RAG] Question: "${text}"`);
        
        const payload = {
          question: text,
          documentId: currentDocId
        };
        console.log('📤 [RAG] POST Payload:', JSON.stringify(payload));

        const queryRes = await fetch(`${RAG_BASE_URL}/api/query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        console.log(`📡 [RAG] Query Status: ${queryRes.status}`);

        if (queryRes.ok) {
          // Note: Guide mentions streaming, which we wait for fully here as buffer
          const rawResponse = await queryRes.text();
          console.log('📄 [RAG] Full AI Response Received:', rawResponse.substring(0, 50) + '...');
          addMessage(rawResponse || "I couldn't find a specific answer in your documents.", 'bot');
        } else {
          const contentType = queryRes.headers.get('content-type');
          let errorInfo = '';
          if (contentType && contentType.includes('application/json')) {
            const errData = await queryRes.json();
            errorInfo = errData.message || errData.error || `Code: ${queryRes.status}`;
          } else {
            errorInfo = await queryRes.text();
          }
          throw new Error(`Query failed: ${errorInfo}`);
        }
      }
    } catch (error: any) {
      console.error('❌ [RAG] Critical Error:', error.message);
      addMessage(`⚠️ **RAG System Error**\n\n${error.message || 'The server rejected the request.'}\n\nCheck your console logs for details.`, 'bot');
    } finally {
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? bottomOffset + 4 : 4}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Second Brain</Text>
              <View style={styles.privacyBadge}>
                <Cloud size={11} color={Colors.theme.accent} />
                <Text style={styles.privacyText}>{documentId ? 'Document Indexed' : 'Cloud RAG Active'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(!showFilter)}>
              <Text style={styles.filterBtnText}>{selectedSubject}</Text>
              <ChevronDown size={14} color={Colors.theme.accent} />
            </TouchableOpacity>
          </View>

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

          <ScrollView
            ref={scrollRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
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
                  {!isUser && (
                    <View style={styles.botIcon}>
                      <Cpu size={13} color={Colors.theme.accentSecondary} />
                    </View>
                  )}

                  <View style={[
                    styles.bubbleContent,
                    isUser ? styles.userBubbleContent : styles.botBubbleContent,
                  ]}>
                    {msg.attachment && (
                      <View style={styles.attachmentBadge}>
                        <FileText size={12} color={Colors.theme.accent} />
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {msg.attachment.name}
                        </Text>
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
            
            {isTyping && (
              <View style={[styles.bubbleRow, styles.bubbleRowLeft]}>
                <View style={styles.botIcon}><Cpu size={13} color={Colors.theme.accentSecondary} /></View>
                <View style={[styles.bubbleContent, styles.botBubbleContent, { minWidth: 60, paddingVertical: 12 }]}>
                  <ActivityIndicator size="small" color={Colors.theme.accent} />
                </View>
              </View>
            )}
          </ScrollView>

          {pendingFile && (
            <View style={styles.pendingFileBar}>
              <FileText size={14} color={Colors.theme.accent} />
              <Text style={styles.pendingFileName} numberOfLines={1}>{pendingFile.name}</Text>
              <TouchableOpacity onPress={() => setPendingFile(null)} style={styles.pendingRemoveBtn}>
                <X size={14} color={Colors.theme.textMuted} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.inputRow, { paddingBottom: Math.max(insets.bottom, 12) + 48 }]}>
            <TouchableOpacity style={styles.attachBtn} onPress={handlePickFile} activeOpacity={0.7}>
              <Paperclip size={19} color={pendingFile ? Colors.theme.accent : Colors.theme.textMuted} />
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              placeholder={documentId ? "Ask your documents..." : "Upload a PDF first..."}
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
              disabled={!(inputText.trim() || pendingFile) || isTyping}
            >
              {isTyping ? <ActivityIndicator size="small" color="#fff" /> : <Send size={17} color="#FFFFFF" />}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingTop: 10, paddingBottom: 8 },
  title: { color: Colors.theme.text, fontSize: 24, fontWeight: '700' },
  privacyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  privacyText: { color: Colors.theme.accent, fontSize: 10, fontWeight: '600' },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)' },
  filterBtnText: { color: Colors.theme.accent, fontSize: 12, fontWeight: '600' },
  dropdown: { marginHorizontal: 18, backgroundColor: Colors.theme.cardSolid, borderRadius: 12, borderWidth: 1, borderColor: Colors.theme.border, marginBottom: 6, overflow: 'hidden' },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  dropdownItemActive: { backgroundColor: 'rgba(59,130,246,0.08)' },
  dropdownText: { color: Colors.theme.text, fontSize: 13 },
  chatArea: { flex: 1 },
  chatContent: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 20 },
  bubbleRow: { flexDirection: 'row', marginBottom: 12, maxWidth: '85%' },
  bubbleRowLeft: { alignSelf: 'flex-start', alignItems: 'flex-end', gap: 8 },
  bubbleRowRight: { alignSelf: 'flex-end' },
  botIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(34,211,238,0.15)', justifyContent: 'center', alignItems: 'center', marginBottom: 4, flexShrink: 0 },
  bubbleContent: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
  botBubbleContent: { backgroundColor: 'rgba(30, 41, 59, 0.7)', borderColor: 'rgba(255,255,255,0.08)', borderBottomLeftRadius: 4 },
  userBubbleContent: { backgroundColor: 'rgba(59, 130, 246, 0.22)', borderColor: 'rgba(59, 130, 246, 0.3)', borderBottomRightRadius: 4 },
  bubbleText: { color: Colors.theme.text, fontSize: 14, lineHeight: 21, letterSpacing: 0.2 },
  userBubbleText: { color: '#F8FAFC' },
  timestamp: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 6, textAlign: 'right' },
  userTimestamp: { color: 'rgba(255,255,255,0.4)' },
  attachmentBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  attachmentName: { flex: 1, color: Colors.theme.accent, fontSize: 12, fontWeight: '600' },
  pendingFileBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, backgroundColor: 'rgba(59, 130, 246, 0.12)', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(59, 130, 246, 0.3)' },
  pendingFileName: { flex: 1, color: Colors.theme.accent, fontSize: 13, fontWeight: '700' },
  pendingRemoveBtn: { padding: 2 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', backgroundColor: '#0F172A', gap: 10 },
  attachBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.04)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', flexShrink: 0, marginBottom: 2 },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 22, paddingHorizontal: 18, paddingVertical: Platform.OS === 'ios' ? 12 : 10, color: Colors.theme.text, fontSize: 15, lineHeight: 22, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', minHeight: 44, maxHeight: 140, textAlignVertical: 'center' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.theme.accent, justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginBottom: 2, shadowColor: Colors.theme.accent, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  sendBtnDisabled: { backgroundColor: 'rgba(59, 130, 246, 0.25)', shadowOpacity: 0, elevation: 0 },
});

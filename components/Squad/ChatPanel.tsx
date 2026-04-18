import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { Send, Code } from 'lucide-react-native';
import { useSocket, ChatMessage } from '@/context/SocketContext';

export default function ChatPanel() {
  const { messages, sendMessage, currentUser } = useSocket();
  const [input, setInput] = useState('');
  const [codeMode, setCodeMode] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 120);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input.trim(), codeMode);
    setInput('');
  };

  const isMe = (msg: ChatMessage) => msg.senderId === currentUser?.id;

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const mine = isMe(item);
    return (
      <View style={[styles.bubbleRow, mine ? styles.bubbleRowRight : styles.bubbleRowLeft]}>
        {/* Avatar for other users */}
        {!mine && (
          <View style={[styles.msgAvatar, { backgroundColor: `${item.color}25` }]}>
            <Text style={[styles.msgAvatarText, { color: item.color }]}>
              {item.sender.split(' ').map(w => w[0]).join('').slice(0, 2)}
            </Text>
          </View>
        )}
        <View style={[styles.bubble, mine ? styles.myBubble : styles.otherBubble]}>
          {!mine && (
            <Text style={[styles.senderName, { color: item.color }]}>{item.sender}</Text>
          )}
          {item.isCode ? (
            <View style={styles.codeBlock}>
              <Text style={styles.codeText}>{item.text}</Text>
            </View>
          ) : (
            <Text style={[styles.msgText, mine && styles.myMsgText]}>{item.text}</Text>
          )}
          <Text style={[styles.timeText, mine && styles.myTimeText]}>{item.time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TouchableOpacity
          style={[styles.codeModeBtn, codeMode && styles.codeModeActive]}
          onPress={() => setCodeMode(!codeMode)}
          activeOpacity={0.7}
        >
          <Code size={17} color={codeMode ? '#3B82F6' : '#64748B'} />
        </TouchableOpacity>
        <TextInput
          style={[styles.input, codeMode && styles.codeInput]}
          placeholder={codeMode ? '// Paste code snippet...' : 'Type a message...'}
          placeholderTextColor="#4B5563"
          value={input}
          onChangeText={setInput}
          multiline={codeMode}
          returnKeyType={codeMode ? 'default' : 'send'}
          onSubmitEditing={codeMode ? undefined : handleSend}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
          onPress={handleSend}
          activeOpacity={0.7}
          disabled={!input.trim()}
        >
          <Send size={17} color={input.trim() ? '#fff' : '#4B5563'} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 14, paddingBottom: 6 },

  bubbleRow: {
    flexDirection: 'row',
    marginBottom: 8,
    maxWidth: '82%',
  },
  bubbleRowLeft: { alignSelf: 'flex-start', alignItems: 'flex-end' },
  bubbleRowRight: { alignSelf: 'flex-end' },

  msgAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  msgAvatarText: { fontSize: 10, fontWeight: '700' },

  bubble: { borderRadius: 16, padding: 11, paddingHorizontal: 14, flex: 1 },
  myBubble: {
    backgroundColor: 'rgba(59,130,246,0.18)',
    borderBottomRightRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
  },
  otherBubble: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  senderName: { fontSize: 11, fontWeight: '700', marginBottom: 3, letterSpacing: 0.2 },
  msgText: { color: '#CBD5E1', fontSize: 13, lineHeight: 19 },
  myMsgText: { color: '#E2E8F0' },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  codeText: {
    color: '#10B981',
    fontSize: 11,
    lineHeight: 17,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timeText: { color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 4, alignSelf: 'flex-end' },
  myTimeText: { color: 'rgba(255,255,255,0.4)' },

  // Input Bar
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 8,
  },
  codeModeBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  codeModeActive: {
    backgroundColor: 'rgba(59,130,246,0.12)',
    borderColor: 'rgba(59,130,246,0.25)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    paddingHorizontal: 15, paddingVertical: 9,
    color: '#E2E8F0', fontSize: 13, maxHeight: 100,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderRadius: 12, fontSize: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(16,185,129,0.15)',
  },
  sendBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: 'rgba(255,255,255,0.05)' },
});

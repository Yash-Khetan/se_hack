import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Spacing, Shadows } from '../theme/colors';
import { socket } from '../utils/socket';

export default function ChatPanel({ roomId }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [isCodeMode, setIsCodeMode] = useState(false);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [showPinned, setShowPinned] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    // Listen for incoming messages
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, { ...msg, self: false }]);
    };
    socket.on('receive_message', handleReceiveMessage);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
    };
  }, []);

  const sendMessage = () => {
    if (!text.trim()) return;
    const msg = {
      id: Date.now().toString(),
      name: 'Guest', // In production, this would be the actual user name
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      self: true,
      isCode: isCodeMode,
    };
    
    // Update locally instantly
    setMessages(prev => [...prev, msg]);
    
    // Broadcast via socket (without 'self' flag)
    const broadcastMsg = { ...msg, self: false };
    socket.emit('send_message', { roomId, message: broadcastMsg });

    setText('');
    setIsCodeMode(false);
  };

  const pinMessage = (msg) => {
    if (pinnedMessages.find(p => p.id === msg.id)) return;
    setPinnedMessages(prev => [msg, ...prev]);
  };

  const renderMessage = ({ item, index }) => (
    <MessageBubble message={item} onPin={() => pinMessage(item)} index={index} />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="chatbubbles" size={18} color={Colors.primaryLight} />
          <Text style={styles.headerTitle}>Chat</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{messages.length}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.pinnedBtn, showPinned && styles.pinnedBtnActive]}
          onPress={() => setShowPinned(!showPinned)}
        >
          <Ionicons name="pin" size={14} color={showPinned ? Colors.warning : Colors.textMuted} />
          <Text style={[styles.pinnedBtnText, showPinned && { color: Colors.warning }]}>
            {pinnedMessages.length}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Pinned Messages Bar */}
      {showPinned && pinnedMessages.length > 0 && (
        <View style={styles.pinnedBar}>
          <Ionicons name="pin" size={12} color={Colors.warning} />
          <Text style={styles.pinnedBarText} numberOfLines={1}>
            {pinnedMessages[0].text}
          </Text>
        </View>
      )}

      {/* Pinned Messages Panel */}
      {showPinned && (
        <View style={styles.pinnedPanel}>
          {pinnedMessages.length === 0 ? (
            <Text style={styles.emptyPinText}>No pinned messages yet. Long-press to pin.</Text>
          ) : (
            pinnedMessages.map((m, i) => (
              <View key={i} style={styles.pinnedItem}>
                <View style={styles.pinnedMeta}>
                  <Text style={styles.pinnedName}>{m.name}</Text>
                  <Text style={styles.pinnedTime}>{m.time}</Text>
                </View>
                <Text style={[styles.pinnedText, m.isCode && styles.codeText]} numberOfLines={2}>
                  {m.text}
                </Text>
              </View>
            ))
          )}
        </View>
      )}

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        contentContainerStyle={styles.messageContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputArea}>
          <TouchableOpacity
            style={[styles.codeToggle, isCodeMode && styles.codeToggleActive]}
            onPress={() => setIsCodeMode(!isCodeMode)}
          >
            <Ionicons name="code-slash" size={18} color={isCodeMode ? Colors.primary : Colors.textMuted} />
          </TouchableOpacity>

          <TextInput
            style={[styles.input, isCodeMode && styles.codeInput]}
            value={text}
            onChangeText={setText}
            placeholder={isCodeMode ? '// Write code...' : 'Type a message...'}
            placeholderTextColor={Colors.textMuted}
            multiline
            maxLength={2000}
            onSubmitEditing={sendMessage}
          />

          <TouchableOpacity
            style={[styles.sendBtn, text.trim() && styles.sendBtnActive]}
            onPress={sendMessage}
            disabled={!text.trim()}
          >
            <Ionicons name="send" size={18} color={text.trim() ? '#fff' : Colors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function MessageBubble({ message, onPin, index }) {
  const { name, text, time, self, isCode } = message;
  const slideAnim = useRef(new Animated.Value(self ? 30 : -30)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay: index * 30, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 300, delay: index * 30, useNativeDriver: true }),
    ]).start();
  }, []);

  const avatarColors = {
    'You': ['#6C5CE7', '#A855F7'],
    'Aarav Shah': ['#3B82F6', '#06B6D4'],
    'Priya Menon': ['#EC4899', '#F472B6'],
    'Dev Kapoor': ['#10B981', '#34D399'],
  };

  return (
    <Animated.View style={[
      styles.msgContainer,
      self && styles.msgSelf,
      { opacity: opacityAnim, transform: [{ translateX: slideAnim }] },
    ]}>
      {!self && (
        <View style={[styles.avatar, { backgroundColor: (avatarColors[name] || ['#6C5CE7'])[0] + '30' }]}>
          <Text style={[styles.avatarText, { color: (avatarColors[name] || ['#6C5CE7'])[0] }]}>
            {name[0]}
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.bubble,
          self ? styles.bubbleSelf : styles.bubbleOther,
          isCode && styles.bubbleCode,
        ]}
        onLongPress={onPin}
        activeOpacity={0.8}
      >
        {!self && <Text style={styles.msgName}>{name}</Text>}
        <Text style={[
          styles.msgText,
          self && styles.msgTextSelf,
          isCode && styles.codeText,
        ]}>
          {text}
        </Text>
        <View style={styles.msgMeta}>
          <Text style={styles.msgTime}>{time}</Text>
          {isCode && (
            <View style={styles.codeTag}>
              <Text style={styles.codeTagText}>CODE</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  badge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    ...Typography.caption,
    color: '#fff',
    fontSize: 10,
  },
  pinnedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  pinnedBtnActive: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
  },
  pinnedBtnText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  pinnedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(245, 158, 11, 0.15)',
  },
  pinnedBarText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
    flex: 1,
  },
  pinnedPanel: {
    backgroundColor: Colors.bgSecondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    maxHeight: 150,
  },
  pinnedItem: {
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  pinnedMeta: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  pinnedName: {
    ...Typography.caption,
    color: Colors.textAccent,
    fontWeight: '600',
  },
  pinnedTime: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  pinnedText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  emptyPinText: {
    ...Typography.bodySm,
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 8,
  },
  messageList: {
    flex: 1,
  },
  messageContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  msgContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    maxWidth: '85%',
  },
  msgSelf: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    width: 30, height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
  },
  bubble: {
    borderRadius: BorderRadius.lg,
    padding: 10,
    paddingHorizontal: 14,
    maxWidth: '90%',
  },
  bubbleSelf: {
    backgroundColor: 'rgba(108, 92, 231, 0.25)',
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleCode: {
    backgroundColor: 'rgba(30, 32, 64, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.2)',
  },
  msgName: {
    ...Typography.caption,
    color: Colors.textAccent,
    fontWeight: '600',
    marginBottom: 3,
  },
  msgText: {
    ...Typography.body,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  msgTextSelf: {
    color: Colors.textPrimary,
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: Colors.primaryLight,
    lineHeight: 18,
  },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 6,
    marginTop: 4,
  },
  msgTime: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  codeTag: {
    backgroundColor: 'rgba(108, 92, 231, 0.2)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  codeTagText: {
    fontSize: 8,
    fontWeight: '700',
    color: Colors.primaryLight,
    letterSpacing: 0.5,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: Colors.bgSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.glassBorder,
    gap: 8,
  },
  codeToggle: {
    width: 38, height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeToggleActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    backgroundColor: 'rgba(30, 32, 64, 0.8)',
  },
  sendBtn: {
    width: 38, height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnActive: {
    backgroundColor: Colors.primary,
    ...Shadows.small,
  },
});

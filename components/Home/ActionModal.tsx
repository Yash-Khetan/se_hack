import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Dimensions, TextInput } from 'react-native';
import { X, QrCode, Plus, Brain, Users } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Colors from '@/constants/Colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const actionContent: Record<string, { title: string; icon: any; description: string }> = {
  scan: { title: 'Scan Timetable', icon: QrCode, description: 'Upload or scan your class schedule to auto-populate your calendar.' },
  task: { title: 'Add New Task', icon: Plus, description: 'Create a new task with a deadline.' },
  brain: { title: 'Ask Second Brain', icon: Brain, description: 'Ask your AI-powered study assistant anything.' },
  squad: { title: 'Join a Squad', icon: Users, description: 'Enter a squad code to join a study group.' },
};

interface Props {
  visible: boolean;
  actionId: string | null;
  onClose: () => void;
}

export default function ActionModal({ visible, actionId, onClose }: Props) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        stiffness: 150,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  if (!actionId || !actionContent[actionId]) return null;

  const content = actionContent[actionId];
  const Icon = content.icon;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}>
          <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.content}>
            {/* Handle */}
            <View style={styles.handle} />

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Icon size={28} color={Colors.theme.accent} />
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <X size={20} color={Colors.theme.textMuted} />
              </TouchableOpacity>
            </View>

            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>

            {/* Input field for task/squad */}
            {(actionId === 'task' || actionId === 'squad') && (
              <TextInput
                style={styles.input}
                placeholder={actionId === 'task' ? 'Enter task name...' : 'Enter squad code...'}
                placeholderTextColor={Colors.theme.textMuted}
              />
            )}

            {/* CTA Button */}
            <TouchableOpacity style={styles.ctaButton} onPress={onClose}>
              <Text style={styles.ctaText}>
                {actionId === 'scan' ? 'Open Camera' : actionId === 'task' ? 'Create Task' : actionId === 'brain' ? 'Open Chat' : 'Join Squad'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    minHeight: SCREEN_HEIGHT * 0.4,
    overflow: 'hidden',
  },
  content: {
    padding: 24,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: Colors.theme.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: Colors.theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    color: Colors.theme.text,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.theme.border,
  },
  ctaButton: {
    backgroundColor: Colors.theme.accent,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#020617',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

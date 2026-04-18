import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, StatusBar, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../theme/colors';

export default function CreateRoomScreen({ navigation }) {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const generateRoomId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let id = '';
    for (let i = 0; i < 8; i++) id += chars[Math.floor(Math.random() * chars.length)];
    setRoomId(id);
  };

  const handleCreate = () => {
    if (!roomId.trim()) {
      Alert.alert('Room ID Required', 'Please enter or generate a Room ID.');
      return;
    }
    if (password.length < 4) {
      Alert.alert('Weak Password', 'Password must be at least 4 characters.');
      return;
    }
    navigation.navigate('Meeting', { roomId: roomId.trim(), password, isHost: true });
  };

  return (
    <LinearGradient colors={Colors.gradientLanding} style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.inner}
      >
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={[styles.content, {
            opacity: fadeAnim, transform: [{ translateY: slideUp }],
          }]}>
            {/* Icon */}
            <LinearGradient colors={Colors.gradientPrimary} style={styles.iconCircle}>
              <Ionicons name="add-circle" size={32} color="#fff" />
            </LinearGradient>

            <Text style={styles.title}>Create Room</Text>
            <Text style={styles.subtitle}>Set up a collaboration space for your team</Text>

            {/* Room ID Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Room ID</Text>
              <View style={styles.inputRow}>
                <View style={styles.inputWrap}>
                  <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={roomId}
                    onChangeText={setRoomId}
                    placeholder="Enter or generate Room ID"
                    placeholderTextColor={Colors.textMuted}
                    autoCapitalize="characters"
                    maxLength={12}
                  />
                </View>
                <TouchableOpacity style={styles.generateBtn} onPress={generateRoomId}>
                  <Ionicons name="dice" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Password Field */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Room Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Set a secure password"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPass}
                />
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Room Settings Preview */}
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Ionicons name="videocam" size={16} color={Colors.success} />
                <Text style={styles.settingText}>Video enabled by default</Text>
              </View>
              <View style={styles.settingRow}>
                <Ionicons name="chatbubbles" size={16} color={Colors.info} />
                <Text style={styles.settingText}>Real-time chat & code sharing</Text>
              </View>
              <View style={styles.settingRow}>
                <Ionicons name="brush" size={16} color={Colors.accent} />
                <Text style={styles.settingText}>Collaborative whiteboard</Text>
              </View>
              <View style={styles.settingRow}>
                <Ionicons name="people" size={16} color={Colors.warning} />
                <Text style={styles.settingText}>Up to 20 participants</Text>
              </View>
            </View>

            {/* Create Button */}
            <TouchableOpacity onPress={handleCreate} activeOpacity={0.85} style={styles.createBtnOuter}>
              <LinearGradient
                colors={Colors.gradientPrimary}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.createBtn}
              >
                <Ionicons name="rocket" size={20} color="#fff" />
                <Text style={styles.createBtnText}>Create & Join Room</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, paddingHorizontal: Spacing.xxl, paddingTop: 60 },
  scrollContent: { paddingBottom: 40 },
  backBtn: {
    width: 40, height: 40,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  content: {},
  iconCircle: {
    width: 64, height: 64,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Shadows.glow,
  },
  title: {
    ...Typography.h1,
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  fieldGroup: { marginBottom: 20 },
  label: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    ...Typography.body,
    color: Colors.textPrimary,
    height: '100%',
  },
  eyeBtn: { padding: 4 },
  generateBtn: {
    width: 52, height: 52,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.small,
  },
  settingsCard: {
    backgroundColor: 'rgba(108, 92, 231, 0.08)',
    borderRadius: BorderRadius.lg,
    padding: 16,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(108, 92, 231, 0.15)',
    gap: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingText: {
    ...Typography.bodySm,
    color: Colors.textSecondary,
  },
  createBtnOuter: {
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    gap: 10,
  },
  createBtnText: {
    ...Typography.button,
    color: '#fff',
  },
});

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Animated, KeyboardAvoidingView, Platform, StatusBar, Alert, ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Shadows, BorderRadius, Typography, Spacing } from '../theme/colors';

export default function JoinRoomScreen({ navigation }) {
  const [roomId, setRoomId] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideUp, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleJoin = () => {
    if (!roomId.trim()) {
      triggerShake();
      Alert.alert('Room ID Required', 'Please enter the Room ID to join.');
      return;
    }
    if (!password.trim()) {
      triggerShake();
      Alert.alert('Password Required', 'Please enter the room password.');
      return;
    }
    navigation.navigate('Meeting', { roomId: roomId.trim(), password, isHost: false });
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
          opacity: fadeAnim,
          transform: [{ translateY: slideUp }, { translateX: shakeAnim }],
        }]}>
          {/* Icon */}
          <LinearGradient colors={Colors.gradientSecondary} style={styles.iconCircle}>
            <Ionicons name="enter" size={32} color="#fff" />
          </LinearGradient>

          <Text style={styles.title}>Join Room</Text>
          <Text style={styles.subtitle}>Enter the room credentials shared by your host</Text>

          {/* Room ID Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Room ID</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="key-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={roomId}
                onChangeText={setRoomId}
                placeholder="Paste or type Room ID"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="characters"
                maxLength={12}
              />
              <TouchableOpacity
                onPress={async () => {
                  // Clipboard paste would go here
                  Alert.alert('Tip', 'Paste the Room ID shared by your host');
                }}
                style={styles.pasteBtn}
              >
                <Ionicons name="clipboard-outline" size={16} color={Colors.primaryLight} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter room password"
                placeholderTextColor={Colors.textMuted}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Ionicons name={showPass ? 'eye-off' : 'eye'} size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="information-circle" size={20} color={Colors.info} />
            <Text style={styles.infoText}>
              Ask your room host for the Room ID and password. You'll join their collaborative workspace with video, chat, and whiteboard.
            </Text>
          </View>

          {/* Recent Rooms (mock) */}
          <Text style={styles.recentLabel}>Recent Rooms</Text>
          <View style={styles.recentList}>
            {[
              { id: 'HACK2026', time: '2 hours ago', members: 4 },
              { id: 'DSAMEET', time: 'Yesterday', members: 3 },
            ].map((r, i) => (
              <TouchableOpacity
                key={i}
                style={styles.recentCard}
                onPress={() => setRoomId(r.id)}
              >
                <View style={styles.recentIcon}>
                  <Ionicons name="time" size={16} color={Colors.primaryLight} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentId}>{r.id}</Text>
                  <Text style={styles.recentTime}>{r.time} · {r.members} members</Text>
                </View>
                <Ionicons name="arrow-forward-circle" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Join Button */}
          <TouchableOpacity onPress={handleJoin} activeOpacity={0.85} style={styles.joinBtnOuter}>
            <LinearGradient
              colors={Colors.gradientSecondary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.joinBtn}
            >
              <Ionicons name="log-in" size={20} color="#fff" />
              <Text style={styles.joinBtnText}>Join Room</Text>
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
  scrollContent: { paddingBottom: 40 },
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
  inputWrap: {
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
  pasteBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(6, 182, 212, 0.08)',
    borderRadius: BorderRadius.md,
    padding: 14,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.15)',
    gap: 10,
  },
  infoText: {
    flex: 1,
    ...Typography.bodySm,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  recentLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginLeft: 4,
  },
  recentList: { gap: 8, marginBottom: 28 },
  recentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    gap: 12,
  },
  recentIcon: {
    width: 36, height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recentId: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  recentTime: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  joinBtnOuter: {
    borderRadius: BorderRadius.xl,
    ...Shadows.medium,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
    gap: 10,
  },
  joinBtnText: {
    ...Typography.button,
    color: '#fff',
  },
});

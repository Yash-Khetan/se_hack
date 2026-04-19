import React, { useState, useRef } from 'react';
import {
  StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity,
  Dimensions, Animated as RNAnimated, Alert, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Users, Plus, ArrowLeft, Copy, Shield, Hash, User,
  Sparkles, LogIn, Zap, Lock, Wifi,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import GradientBackground from '@/components/Shared/GradientBackground';

import { useTheme } from '@/context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 9; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${result.slice(0, 3)}-${result.slice(3, 6)}-${result.slice(6)}`;
}

function getLocalIp() {
  try {
    const uri = Constants.expoConfig?.hostUri || Constants.manifest2?.extra?.expoGo?.debuggerHost || '';
    const match = uri.match(/([0-9\.]+):/);
    if (match) return match[1];
  } catch (e) {}
  return '';
}

const defaultIp = getLocalIp();

type ScreenState = 'landing' | 'create' | 'join';

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const [screen, setScreen] = useState<ScreenState>('landing');

  // Create Room state
  const [createName, setCreateName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [roomId] = useState(generateRoomId());
  const [roomPassword, setRoomPassword] = useState('');
  const [serverUrl, setServerUrl] = useState(defaultIp);

  // Join Room state
  const [joinName, setJoinName] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [joinPassword, setJoinPassword] = useState('');
  const [joinServerUrl, setJoinServerUrl] = useState(defaultIp);

  // Transition animation
  const fadeAnim = useRef(new RNAnimated.Value(1)).current;
  const slideAnim = useRef(new RNAnimated.Value(0)).current;

  const navigateTo = (target: ScreenState) => {
    RNAnimated.parallel([
      RNAnimated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      RNAnimated.timing(slideAnim, { toValue: -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setScreen(target);
      slideAnim.setValue(20);
      RNAnimated.parallel([
        RNAnimated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        RNAnimated.spring(slideAnim, { toValue: 0, damping: 18, stiffness: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  const copyRoomId = async () => {
    try {
      const Clipboard = require('expo-clipboard');
      await Clipboard.setStringAsync(roomId);
      Alert.alert('Copied!', 'Room ID copied to clipboard');
    } catch {
      Alert.alert('Room ID', roomId);
    }
  };

  const buildServerUrl = (ip: string) => {
    const trimmed = ip.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http')) return trimmed;
    return `http://${trimmed}:3005`;
  };

  const handleCreate = () => {
    if (!createName.trim()) {
      Alert.alert('Missing info', 'Please enter your name.');
      return;
    }
    if (!roomName.trim()) {
      Alert.alert('Missing info', 'Please enter a room name.');
      return;
    }
    if (!serverUrl.trim()) {
      Alert.alert('Missing info', 'Please enter the server IP (e.g. 192.168.1.5).');
      return;
    }
    router.push({
      pathname: '/meeting',
      params: {
        roomName: roomName.trim(),
        roomId,
        password: roomPassword,
        userName: createName.trim(),
        isHost: 'true',
        serverUrl: buildServerUrl(serverUrl),
      },
    } as any);
  };

  const handleJoin = () => {
    if (!joinName.trim() || !joinRoomId.trim()) {
      Alert.alert('Missing info', 'Please enter your name and the Room ID.');
      return;
    }
    if (!joinServerUrl.trim()) {
      Alert.alert('Missing info', 'Please enter the server IP (e.g. 192.168.1.5).');
      return;
    }
    router.push({
      pathname: '/meeting',
      params: {
        roomName: 'Meeting Room',
        roomId: joinRoomId.trim(),
        password: joinPassword,
        userName: joinName.trim(),
        isHost: 'false',
        serverUrl: buildServerUrl(joinServerUrl),
      },
    } as any);
  };

  // ── LANDING ──
  const renderLanding = () => (
    <View style={styles.landingContainer}>
      <View style={styles.heroSection}>
        <View style={styles.heroIconWrap}>
          <View style={styles.heroIconRing}>
            <Users size={32} color="#3B82F6" />
          </View>
          <View style={styles.heroGlow} />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>SQUADS</Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
          Real-time collaboration hub{'\n'}Chat, draw, and react together.
        </Text>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.actionCard, styles.createCard]}
          onPress={() => navigateTo('create')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconWrap}>
            <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(59,130,246,0.15)' }]}>
              <Plus size={24} color="#3B82F6" />
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Create Room</Text>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Start a new room and share the code</Text>
          </View>
          <Sparkles size={18} color="rgba(59,130,246,0.6)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, styles.joinCard]}
          onPress={() => navigateTo('join')}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconWrap}>
            <View style={[styles.cardIconCircle, { backgroundColor: 'rgba(16,185,129,0.15)' }]}>
              <LogIn size={24} color="#10B981" />
            </View>
          </View>
          <View style={styles.cardContent}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Join Room</Text>
            <Text style={[styles.cardDesc, { color: colors.textMuted }]}>Enter a room code to join a session</Text>
          </View>
          <Zap size={18} color="rgba(16,185,129,0.6)" />
        </TouchableOpacity>
      </View>

      <View style={styles.featurePills}>
        {['Socket.IO', 'Live Chat', 'Whiteboard', 'Emojis'].map((f, i) => (
          <View key={i} style={[styles.pill, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
            <Text style={[styles.pillText, { color: colors.textMuted }]}>{f}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  // ── CREATE ROOM ──
  const renderCreate = () => (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('landing')}>
        <ArrowLeft size={20} color={colors.textMuted} />
        <Text style={[styles.backText, { color: colors.textMuted }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.formHeader}>
        <View style={[styles.formIconCircle, { backgroundColor: 'rgba(59,130,246,0.12)' }]}>
          <Plus size={22} color="#3B82F6" />
        </View>
        <Text style={[styles.formTitle, { color: colors.text }]}>Create Room</Text>
        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>Set up a new collaborative room</Text>
      </View>

      {/* Server IP */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Wifi size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Server IP</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, styles.monoInput, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="192.168.x.x"
          placeholderTextColor={colors.textMuted}
          value={serverUrl}
          onChangeText={setServerUrl}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          returnKeyType="next"
        />
        <Text style={[styles.fieldHint, { color: colors.textMuted }]}>Run `node server/index.js` to see your IP</Text>
      </View>

      {/* Your Name */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <User size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Your Name</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="e.g. Aarav Shah"
          placeholderTextColor={colors.textMuted}
          value={createName}
          onChangeText={setCreateName}
          returnKeyType="next"
        />
      </View>

      {/* Room Name */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Hash size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Room Name</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="e.g. Design Sprint Review"
          placeholderTextColor={colors.textMuted}
          value={roomName}
          onChangeText={setRoomName}
          returnKeyType="next"
        />
      </View>

      {/* Room ID */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Shield size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Room ID</Text>
          <View style={styles.autoBadge}>
            <Text style={styles.autoBadgeText}>Auto-generated</Text>
          </View>
        </View>
        <View style={styles.copyRow}>
          <View style={[styles.roomIdDisplay, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
            <Text style={styles.roomIdText}>{roomId}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn} onPress={copyRoomId} activeOpacity={0.7}>
            <Copy size={16} color={colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Lock size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Room Password</Text>
          <Text style={[styles.optionalText, { color: colors.textMuted }]}>(Optional)</Text>
        </View>
        <TextInput
          style={[styles.textField, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="Set a password for security"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={roomPassword}
          onChangeText={setRoomPassword}
        />
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={handleCreate} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Create & Join</Text>
        <Sparkles size={18} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );

  // ── JOIN ROOM ──
  const renderJoin = () => (
    <ScrollView
      style={styles.formScroll}
      contentContainerStyle={[styles.formContent, { paddingBottom: insets.bottom + 80 }]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => navigateTo('landing')}>
        <ArrowLeft size={20} color={colors.textMuted} />
        <Text style={[styles.backText, { color: colors.textMuted }]}>Back</Text>
      </TouchableOpacity>

      <View style={styles.formHeader}>
        <View style={[styles.formIconCircle, { backgroundColor: 'rgba(16,185,129,0.12)' }]}>
          <LogIn size={22} color="#10B981" />
        </View>
        <Text style={[styles.formTitle, { color: colors.text }]}>Join Room</Text>
        <Text style={[styles.formSubtitle, { color: colors.textMuted }]}>Enter the room details to connect</Text>
      </View>

      {/* Server IP */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Wifi size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Server IP</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, styles.monoInput, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="192.168.x.x"
          placeholderTextColor={colors.textMuted}
          value={joinServerUrl}
          onChangeText={setJoinServerUrl}
          keyboardType="numbers-and-punctuation"
          autoCapitalize="none"
          returnKeyType="next"
        />
      </View>

      {/* Your Name */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <User size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Your Name</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="Enter your display name"
          placeholderTextColor={colors.textMuted}
          value={joinName}
          onChangeText={setJoinName}
          returnKeyType="next"
        />
      </View>

      {/* Room ID */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Shield size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Room ID</Text>
          <View style={styles.requiredDot} />
        </View>
        <TextInput
          style={[styles.textField, styles.monoInput, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="XXX-XXX-XXX"
          placeholderTextColor={colors.textMuted}
          value={joinRoomId}
          onChangeText={setJoinRoomId}
          autoCapitalize="characters"
          returnKeyType="next"
        />
      </View>

      {/* Password */}
      <View style={styles.fieldGroup}>
        <View style={styles.fieldLabel}>
          <Lock size={14} color={colors.textMuted} />
          <Text style={[styles.fieldLabelText, { color: colors.textMuted }]}>Room Password</Text>
          <Text style={[styles.optionalText, { color: colors.textMuted }]}>(If set)</Text>
        </View>
        <TextInput
          style={[styles.textField, { color: colors.text, backgroundColor: colors.cardSolid, borderColor: colors.border }]}
          placeholder="Enter room password"
          placeholderTextColor={colors.textMuted}
          secureTextEntry
          value={joinPassword}
          onChangeText={setJoinPassword}
        />
      </View>

      <TouchableOpacity style={[styles.primaryButton, styles.joinButton]} onPress={handleJoin} activeOpacity={0.8}>
        <Text style={styles.primaryButtonText}>Join Meeting</Text>
        <Zap size={18} color="#fff" />
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <RNAnimated.View
          style={[styles.screenWrap, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
        >
          {screen === 'landing' && renderLanding()}
          {screen === 'create' && renderCreate()}
          {screen === 'join' && renderJoin()}
        </RNAnimated.View>
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenWrap: { flex: 1 },

  // Landing
  landingContainer: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  heroSection: { alignItems: 'center', marginBottom: 36 },
  heroIconWrap: { position: 'relative', marginBottom: 18 },
  heroIconRing: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: 'rgba(59,130,246,0.2)',
  },
  heroGlow: {
    position: 'absolute', top: -10, left: -10, right: -10, bottom: -10,
    borderRadius: 50, backgroundColor: 'rgba(59,130,246,0.06)',
  },
  heroTitle: { fontSize: 34, fontWeight: '800', letterSpacing: 4, marginBottom: 10 },
  heroSubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 21 },

  cardsContainer: { gap: 12, marginBottom: 28 },
  actionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 18, padding: 18, borderWidth: 1,
  },
  createCard: { borderColor: 'rgba(59,130,246,0.15)' },
  joinCard: { borderColor: 'rgba(16,185,129,0.15)' },
  cardIconWrap: { marginRight: 14 },
  cardIconCircle: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 3 },
  cardDesc: { fontSize: 12, lineHeight: 17 },

  featurePills: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  pill: {
    paddingHorizontal: 13, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1, 
  },
  pillText: { fontSize: 11, fontWeight: '500' },

  // Forms
  formScroll: { flex: 1 },
  formContent: { paddingHorizontal: 24, paddingTop: 8 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginBottom: 20, alignSelf: 'flex-start', paddingVertical: 6,
  },
  backText: { color: '#94A3B8', fontSize: 15, fontWeight: '500' },
  formHeader: { alignItems: 'center', marginBottom: 28 },
  formIconCircle: {
    width: 56, height: 56, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  formTitle: { fontSize: 24, fontWeight: '700', marginBottom: 6 },
  formSubtitle: { fontSize: 13, textAlign: 'center' },

  fieldGroup: { marginBottom: 18 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  fieldLabelText: { color: '#94A3B8', fontSize: 13, fontWeight: '600' },
  requiredDot: {
    width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444',
  },
  autoBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)', paddingHorizontal: 8,
    paddingVertical: 2, borderRadius: 6, marginLeft: 4,
  },
  autoBadgeText: { color: '#3B82F6', fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  optionalText: { color: '#4B5563', fontSize: 11, marginLeft: 4 },
  textField: {
    borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    fontSize: 15, borderWidth: 1, 
  },
  monoInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 1.5, fontSize: 15,
  },
  fieldHint: { color: '#4B5563', fontSize: 10, marginTop: 5, fontStyle: 'italic' },

  copyRow: { flexDirection: 'row', gap: 10 },
  roomIdDisplay: {
    flex: 1, backgroundColor: 'rgba(59,130,246,0.06)', borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: Platform.OS === 'ios' ? 15 : 12,
    justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(59,130,246,0.12)',
  },
  roomIdText: {
    color: '#3B82F6', fontSize: 17, fontWeight: '700',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', letterSpacing: 2,
  },
  copyBtn: {
    width: 50, borderRadius: 14, backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.15)',
  },

  primaryButton: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10,
    backgroundColor: '#3B82F6', paddingVertical: 16, borderRadius: 16, marginTop: 10,
    shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
  },
  joinButton: { backgroundColor: '#10B981', shadowColor: '#10B981' },
  primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700' },
});

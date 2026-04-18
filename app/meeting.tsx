import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert,
  Animated as RNAnimated, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft, Clock, MessageCircle, PenTool, Users as UsersIcon, Wifi, WifiOff,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { SocketProvider, useSocket } from '@/context/SocketContext';
import ParticipantAvatars from '@/components/Squad/ParticipantAvatars';
import MeetingControls from '@/components/Squad/MeetingControls';
import PanelSheet from '@/components/Squad/PanelSheet';
import ChatPanel from '@/components/Squad/ChatPanel';
import ParticipantsPanel from '@/components/Squad/ParticipantsPanel';
import WhiteboardPanel from '@/components/Squad/WhiteboardPanel';
import EmojiOverlay from '@/components/Squad/EmojiOverlay';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type PanelType = 'chat' | 'whiteboard' | 'participants' | null;

export default function MeetingScreen() {
  const params = useLocalSearchParams();
  const serverUrl = (params.serverUrl as string) || 'http://localhost:3005';
  const roomId = (params.roomId as string) || 'N/A';
  const roomName = (params.roomName as string) || 'Meeting Room';
  const password = (params.password as string) || '';
  const userName = (params.userName as string) || 'You';
  const isHost = params.isHost === 'true';

  return (
    <SocketProvider
      serverUrl={serverUrl}
      roomId={roomId}
      roomName={roomName}
      password={password}
      userName={userName}
      isHost={isHost}
    >
      <MeetingContent roomName={roomName} roomId={roomId} />
    </SocketProvider>
  );
}

function MeetingContent({ roomName, roomId }: { roomName: string; roomId: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    connected, currentUser, participants, joinNotification,
    handRaisedEvent, emojiReactedEvent,
    raiseHand, sendEmoji, leaveRoom,
  } = useSocket();

  const [activePanel, setActivePanel] = useState<PanelType>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Hand raise banner
  const [handBanner, setHandBanner] = useState<string | null>(null);
  const bannerAnim = useRef(new RNAnimated.Value(-80)).current;
  const bannerOpacity = useRef(new RNAnimated.Value(0)).current;

  // Join notification
  const [joinToast, setJoinToast] = useState<string | null>(null);
  const toastAnim = useRef(new RNAnimated.Value(-60)).current;
  const toastOpacity = useRef(new RNAnimated.Value(0)).current;

  // Timer
  useEffect(() => {
    const interval = setInterval(() => setElapsedSeconds(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // Watch hand raise events
  useEffect(() => {
    if (!handRaisedEvent) return;
    const label = handRaisedEvent.isRaised
      ? `${handRaisedEvent.userName} raised hand ✋`
      : `${handRaisedEvent.userName} lowered hand`;
    setHandBanner(label);
    // Reset animations first in case banner is already visible
    bannerAnim.setValue(-80);
    bannerOpacity.setValue(0);
    RNAnimated.parallel([
      RNAnimated.spring(bannerAnim, { toValue: 0, damping: 15, stiffness: 150, useNativeDriver: true }),
      RNAnimated.timing(bannerOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => {
      RNAnimated.parallel([
        RNAnimated.timing(bannerAnim, { toValue: -80, duration: 250, useNativeDriver: true }),
        RNAnimated.timing(bannerOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setHandBanner(null));
    }, 3000);
    return () => clearTimeout(timer);
  }, [handRaisedEvent]);

  // Watch join notifications
  useEffect(() => {
    if (joinNotification) {
      setJoinToast(joinNotification);
      RNAnimated.parallel([
        RNAnimated.spring(toastAnim, { toValue: 0, damping: 15, stiffness: 150, useNativeDriver: true }),
        RNAnimated.timing(toastOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      const timer = setTimeout(() => {
        RNAnimated.parallel([
          RNAnimated.timing(toastAnim, { toValue: -60, duration: 250, useNativeDriver: true }),
          RNAnimated.timing(toastOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start(() => setJoinToast(null));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [joinNotification]);

  const handleHandRaise = () => raiseHand();

  const handleEmoji = () => setShowEmoji(!showEmoji);

  const handleEmojiPress = (emoji: string) => sendEmoji(emoji);

  const handleEndCall = () => {
    Alert.alert('Leave Meeting', 'Are you sure you want to leave?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Leave', style: 'destructive', onPress: () => { leaveRoom(); router.back(); } },
    ]);
  };

  const handlePanelToggle = (panel: PanelType) => {
    setActivePanel(prev => prev === panel ? null : panel);
    setShowEmoji(false);
  };

  return (
    <LinearGradient colors={['#0B1220', '#0F172A']} style={styles.root}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container} edges={['top']}>

        {/* ── Join/Leave Toast ── */}
        {joinToast && (
          <RNAnimated.View style={[
            styles.joinToast,
            { transform: [{ translateY: toastAnim }], opacity: toastOpacity },
          ]}>
            <Text style={styles.joinToastText}>👋 {joinToast}</Text>
          </RNAnimated.View>
        )}

        {/* ── Hand Raise Banner ── */}
        {handBanner && (
          <RNAnimated.View style={[
            styles.handBanner,
            { transform: [{ translateY: bannerAnim }], opacity: bannerOpacity },
          ]}>
            <Text style={styles.handBannerText}>{handBanner}</Text>
          </RNAnimated.View>
        )}

        {/* ── Top Bar ── */}
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.topBackBtn} onPress={() => { leaveRoom(); router.back(); }}>
            <ArrowLeft size={20} color="#94A3B8" />
          </TouchableOpacity>
          <View style={styles.topInfo}>
            <Text style={styles.topRoomName} numberOfLines={1}>{roomName}</Text>
            <Text style={styles.topRoomId}>{roomId}</Text>
          </View>
          <View style={styles.connectionBadge}>
            {connected ? (
              <Wifi size={12} color="#10B981" />
            ) : (
              <WifiOff size={12} color="#EF4444" />
            )}
          </View>
          <View style={styles.timerBadge}>
            <Clock size={12} color="#EF4444" />
            <View style={styles.liveDot} />
            <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
          </View>
        </View>

        {/* ── Participant Avatars ── */}
        <ParticipantAvatars
          participants={participants}
          currentUserId={currentUser?.id}
        />

        {/* ── Central Area (Meeting Info) ── */}
        <View style={styles.centerArea}>
          <View style={styles.roomInfoCard}>
            <Text style={styles.roomInfoEmoji}>📡</Text>
            <Text style={styles.roomInfoTitle}>{roomName}</Text>
            <Text style={styles.roomInfoSub}>
              {participants.length} {participants.length === 1 ? 'person' : 'people'} connected
            </Text>
            <View style={styles.roomInfoDivider} />
            <View style={styles.featureRow}>
              {['Live Chat', 'Whiteboard', 'Reactions'].map((f, i) => (
                <View key={i} style={styles.featurePill}>
                  <Text style={styles.featurePillText}>{f}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* ── Meeting Controls ── */}
        <MeetingControls
          isHandRaised={currentUser?.isHandRaised || false}
          onHandRaise={handleHandRaise}
          onEmoji={handleEmoji}
          onEndCall={handleEndCall}
        />

        {/* ── Bottom Tab Bar ── */}
        <View style={[styles.bottomTabs, { paddingBottom: Math.max(insets.bottom, 8) }]}>
          <TouchableOpacity
            style={[styles.tabItem, activePanel === 'chat' && styles.tabItemActive]}
            onPress={() => handlePanelToggle('chat')}
            activeOpacity={0.7}
          >
            <MessageCircle size={19} color={activePanel === 'chat' ? '#3B82F6' : '#64748B'} />
            <Text style={[styles.tabLabel, activePanel === 'chat' && styles.tabLabelActive]}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activePanel === 'whiteboard' && styles.tabItemActive]}
            onPress={() => handlePanelToggle('whiteboard')}
            activeOpacity={0.7}
          >
            <PenTool size={19} color={activePanel === 'whiteboard' ? '#3B82F6' : '#64748B'} />
            <Text style={[styles.tabLabel, activePanel === 'whiteboard' && styles.tabLabelActive]}>Whiteboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabItem, activePanel === 'participants' && styles.tabItemActive]}
            onPress={() => handlePanelToggle('participants')}
            activeOpacity={0.7}
          >
            <UsersIcon size={19} color={activePanel === 'participants' ? '#3B82F6' : '#64748B'} />
            <Text style={[styles.tabLabel, activePanel === 'participants' && styles.tabLabelActive]}>People</Text>
          </TouchableOpacity>
        </View>

        {/* ── Emoji Overlay ── */}
        <EmojiOverlay
          visible={showEmoji}
          onClose={() => setShowEmoji(false)}
          onEmojiPress={handleEmojiPress}
          incomingEmoji={emojiReactedEvent}
        />

        {/* ── Pull-up Panels ── */}
        <PanelSheet visible={activePanel === 'chat'} title="💬 Chat" onClose={() => setActivePanel(null)}>
          <ChatPanel />
        </PanelSheet>
        <PanelSheet visible={activePanel === 'whiteboard'} title="🎨 Whiteboard" onClose={() => setActivePanel(null)}>
          <WhiteboardPanel />
        </PanelSheet>
        <PanelSheet visible={activePanel === 'participants'} title="👥 Participants" onClose={() => setActivePanel(null)}>
          <ParticipantsPanel />
        </PanelSheet>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  container: { flex: 1 },

  // Toasts
  joinToast: {
    position: 'absolute', top: 55, alignSelf: 'center', zIndex: 200,
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(16,185,129,0.25)',
  },
  joinToastText: { color: '#10B981', fontSize: 13, fontWeight: '700' },

  handBanner: {
    position: 'absolute', top: 95, alignSelf: 'center', zIndex: 200,
    backgroundColor: 'rgba(245,166,35,0.15)',
    paddingHorizontal: 18, paddingVertical: 9, borderRadius: 14,
    borderWidth: 1, borderColor: 'rgba(245,166,35,0.25)',
    shadowColor: '#F5A623', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 8,
  },
  handBannerText: { color: '#F5A623', fontSize: 13, fontWeight: '700' },

  // Top bar
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingVertical: 8, gap: 8,
  },
  topBackBtn: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  topInfo: { flex: 1 },
  topRoomName: { color: '#E2E8F0', fontSize: 15, fontWeight: '700' },
  topRoomId: {
    color: '#4B5563', fontSize: 10, fontFamily: 'SpaceMono',
    marginTop: 1, letterSpacing: 1,
  },
  connectionBadge: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
  },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10,
    gap: 5, borderWidth: 1, borderColor: 'rgba(239,68,68,0.12)',
  },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#EF4444' },
  timerText: { color: '#EF4444', fontSize: 12, fontWeight: '700', fontFamily: 'SpaceMono' },

  // Center area
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  roomInfoCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 24,
    paddingVertical: 28,
    paddingHorizontal: 24,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  roomInfoEmoji: { fontSize: 32, marginBottom: 10 },
  roomInfoTitle: {
    color: '#E2E8F0', fontSize: 20, fontWeight: '700',
    textAlign: 'center', marginBottom: 4,
  },
  roomInfoSub: { color: '#64748B', fontSize: 13, marginBottom: 14 },
  roomInfoDivider: {
    width: 40, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(59,130,246,0.2)', marginBottom: 14,
  },
  featureRow: { flexDirection: 'row', gap: 8 },
  featurePill: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
  },
  featurePillText: { color: '#64748B', fontSize: 10, fontWeight: '500' },

  // Bottom tabs
  bottomTabs: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingTop: 6, borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.04)',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  tabItem: {
    alignItems: 'center', paddingVertical: 6,
    paddingHorizontal: 18, borderRadius: 12, gap: 3,
  },
  tabItemActive: { backgroundColor: 'rgba(59,130,246,0.08)' },
  tabLabel: { color: '#4B5563', fontSize: 10, fontWeight: '600' },
  tabLabelActive: { color: '#3B82F6' },
});

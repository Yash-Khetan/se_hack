import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions, StatusBar, Modal, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { Colors, BorderRadius, Typography, Shadows, Spacing } from '../theme/colors';
import VideoGrid from '../components/VideoGrid';
import MeetingControls from '../components/MeetingControls';
import ChatPanel from '../components/ChatPanel';
import WhiteboardCanvas from '../components/WhiteboardCanvas';
import ParticipantsList from '../components/ParticipantsList';
import * as AgoraUtil from '../utils/agora';
import { connectSocket, disconnectSocket } from '../utils/socket';

const { width, height } = Dimensions.get('window');

const TAB_ITEMS = [
  { id: 'chat', icon: 'chatbubbles', label: 'Chat' },
  { id: 'whiteboard', icon: 'brush', label: 'Board' },
  { id: 'participants', icon: 'people', label: 'People' },
];

export default function MeetingScreen({ route, navigation }) {
  const { roomId, password, isHost } = route?.params || {
    roomId: 'HACK2026', password: '1234', isHost: true,
  };

  const [activeTab, setActiveTab] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCamOn, setIsCamOn] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [showJoinNotif, setShowJoinNotif] = useState(true);
  const [showRaisedBanner, setShowRaisedBanner] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remoteUsers, setRemoteUsers] = useState([]);
  const [agoraEngine, setAgoraEngine] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const joinAnim = useRef(new Animated.Value(0)).current;
  const handAnim = useRef(new Animated.Value(0)).current;
  const panelSlide = useRef(new Animated.Value(height)).current;

  // Timer
  useEffect(() => {
    const timer = setInterval(() => setElapsedTime(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Join notification animation
    Animated.sequence([
      Animated.timing(joinAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.delay(2500),
      Animated.timing(joinAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(() => setShowJoinNotif(false));

    // Agora Setup
    const setup = async () => {
      const engine = await AgoraUtil.initializeAgora();
      if (engine) {
        setAgoraEngine(engine);
        AgoraUtil.setupAgoraListeners(engine, {
          onJoinChannelSuccess: () => {
            console.log('Successfully joined Agora channel');
          },
          onUserJoined: (uid) => {
            setRemoteUsers(prev => [...prev, uid]);
          },
          onUserOffline: (uid) => {
            setRemoteUsers(prev => prev.filter(id => id !== uid));
          },
          onError: (err, msg) => {
            console.warn('Agora Engine Error:', err, msg);
          }
        });
        await AgoraUtil.joinChannel(engine, roomId);
      }
    };
    setup();

    // Start Real-Time Collaboration Socket
    connectSocket(roomId);

    return () => {
      if (agoraEngine) AgoraUtil.leaveChannel(agoraEngine);
      disconnectSocket();
    };
  }, []);

  const handleRaiseHand = () => {
    const newState = !isHandRaised;
    setIsHandRaised(newState);
    if (newState) {
      setShowRaisedBanner(true);
      Animated.sequence([
        Animated.spring(handAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
        Animated.delay(3000),
        Animated.timing(handAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => setShowRaisedBanner(false));
    }
  };

  const handleToggleMic = async () => {
    if (!isMicOn) {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Microphone access is required for voice calls.');
        return;
      }
    }
    setIsMicOn(!isMicOn);
    if (agoraEngine) AgoraUtil.toggleLocalAudio(agoraEngine, !isMicOn);
  };

  const handleToggleCam = async () => {
    if (!isCamOn) {
      const { status } = await Camera.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required for video calls.');
        return;
      }
    }
    setIsCamOn(!isCamOn);
    if (agoraEngine) AgoraUtil.toggleLocalVideo(agoraEngine, !isCamOn);
  };

  const handleShareScreen = async () => {
    if (!agoraEngine) return;

    try {
      if (!isScreenSharing) {
        // Start screen capture
        // params: captureVideo, captureAudio, videoParams
        agoraEngine.startScreenCapture({
          captureVideo: true,
          captureAudio: true,
        });
        setIsScreenSharing(true);
        Alert.alert('Screen Sharing', 'Your screen is now being shared with the room.');
      } else {
        agoraEngine.stopScreenCapture();
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Screen sharing error:', error);
      Alert.alert('Error', 'Failed to start screen sharing.');
    }
  };

  const handleEndCall = () => {
    navigation.goBack();
  };

  // Pull-up panel logic
  const openPanel = (tabId) => {
    setActiveTab(tabId);
    Animated.spring(panelSlide, {
      toValue: 0,
      friction: 9,
      tension: 65,
      useNativeDriver: true,
    }).start();
  };

  const closePanel = () => {
    Animated.timing(panelSlide, {
      toValue: height,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setActiveTab(null));
  };

  const switchTab = (tabId) => {
    if (activeTab === tabId) {
      closePanel();
    } else {
      openPanel(tabId);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={Colors.gradientLanding} style={styles.bg}>
        {/* Top Bar */}
        <SafeAreaView edges={['top']}>
          <View style={styles.topBar}>
            <View style={styles.topLeft}>
              <View style={styles.liveDot} />
              <Text style={styles.roomTitle}>{roomId}</Text>
              <View style={styles.timerBadge}>
                <Ionicons name="time-outline" size={10} color={Colors.textMuted} />
                <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
              </View>
            </View>
            <View style={styles.topRight}>
              <View style={styles.membersBadge}>
                <Ionicons name="people" size={12} color={Colors.primaryLight} />
                <Text style={styles.membersText}>4</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Join Notification */}
        {showJoinNotif && (
          <Animated.View style={[styles.joinNotif, {
            opacity: joinAnim,
            transform: [{
              translateY: joinAnim.interpolate({
                inputRange: [0, 1], outputRange: [-30, 0],
              }),
            }],
          }]}>
            <LinearGradient
              colors={['rgba(16, 185, 129, 0.15)', 'rgba(16, 185, 129, 0.05)']}
              style={styles.joinNotifInner}
            >
              <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
              <Text style={styles.joinNotifText}>
                Connected to <Text style={{ fontWeight: '700' }}>{roomId}</Text>
              </Text>
            </LinearGradient>
          </Animated.View>
        )}

        {/* Raised Hand Banner */}
        {showRaisedBanner && (
          <Animated.View style={[styles.raisedBanner, {
            opacity: handAnim,
            transform: [{
              scale: handAnim.interpolate({
                inputRange: [0, 1], outputRange: [0.8, 1],
              }),
            }],
          }]}>
            <Text style={styles.raisedBannerText}>✋ You raised your hand</Text>
          </Animated.View>
        )}

        {/* Video Grid */}
        <View style={styles.videoArea}>
          <VideoGrid 
            isCamOn={isCamOn} 
            remoteUsers={remoteUsers}
            roomId={roomId}
          />
        </View>

        {/* Meeting Controls */}
        <MeetingControls
          isMicOn={isMicOn}
          isCamOn={isCamOn}
          isHandRaised={isHandRaised}
          onToggleMic={handleToggleMic}
          onToggleCam={handleToggleCam}
          onRaiseHand={handleRaiseHand}
          onShareScreen={handleShareScreen}
          onEndCall={handleEndCall}
        />

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TAB_ITEMS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => switchTab(tab.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon}
                  size={18}
                  color={isActive ? Colors.primaryLight : Colors.textMuted}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Full-Screen Pull-Up Panel */}
        {activeTab && (
          <Animated.View style={[styles.pullUpPanel, {
            transform: [{ translateY: panelSlide }],
          }]}>
            <View style={styles.pullUpHeader}>
              <View style={styles.pullUpHandle} />
              <View style={styles.pullUpTitleRow}>
                <Ionicons
                  name={TAB_ITEMS.find(t => t.id === activeTab)?.icon || 'apps'}
                  size={18}
                  color={Colors.primaryLight}
                />
                <Text style={styles.pullUpTitle}>
                  {activeTab === 'chat' ? 'Chat' : activeTab === 'whiteboard' ? 'Whiteboard' : 'Participants'}
                </Text>
                <TouchableOpacity style={styles.pullUpClose} onPress={closePanel}>
                  <Ionicons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.pullUpContent}>
              {activeTab === 'chat' && <ChatPanel roomId={roomId} />}
              {activeTab === 'whiteboard' && <WhiteboardCanvas roomId={roomId} />}
              {activeTab === 'participants' && (
                <ParticipantsList roomId={roomId} password={password} onClose={closePanel} />
              )}
            </View>
          </Animated.View>
        )}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  liveDot: {
    width: 8, height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  roomTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  timerText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 10,
  },
  topRight: {
    flexDirection: 'row',
    gap: 6,
  },
  membersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  membersText: {
    ...Typography.caption,
    color: Colors.primaryLight,
    fontWeight: '600',
  },
  joinNotif: {
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  joinNotifInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  joinNotifText: {
    ...Typography.bodySm,
    color: Colors.success,
  },
  raisedBanner: {
    alignSelf: 'center',
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.round,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    marginBottom: 4,
  },
  raisedBannerText: {
    ...Typography.bodySm,
    color: Colors.warning,
    fontWeight: '600',
  },
  videoArea: {
    flex: 1,
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 6,
    paddingBottom: 12,
    gap: 4,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  tabItemActive: {
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
  },
  tabLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  tabLabelActive: {
    color: Colors.primaryLight,
    fontWeight: '600',
  },

  // Pull-up full-screen panel
  pullUpPanel: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.bg,
    zIndex: 100,
  },
  pullUpHeader: {
    paddingTop: Platform.OS === 'ios' ? 54 : 36,
    paddingHorizontal: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.glassBorder,
    backgroundColor: Colors.bgSecondary,
  },
  pullUpHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  pullUpTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pullUpTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    flex: 1,
  },
  pullUpClose: {
    width: 34, height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pullUpContent: {
    flex: 1,
  },
});

import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Shadows } from '../theme/colors';

const { width } = Dimensions.get('window');
const CARD_GAP = 8;

// Try to load Agora video view, fall back gracefully
let RtcSurfaceView = null;
let VideoSourceType = null;
try {
  const agora = require('react-native-agora');
  RtcSurfaceView = agora.RtcSurfaceView;
  VideoSourceType = agora.VideoSourceType;
} catch (e) {
  // Demo mode — no native video rendering
}

const AVATAR_COLORS = [
  ['#6C5CE7', '#A855F7'],
  ['#3B82F6', '#06B6D4'],
  ['#EC4899', '#F472B6'],
  ['#10B981', '#34D399'],
  ['#F59E0B', '#FBBF24'],
  ['#EF4444', '#F97316'],
];

function getInitials(name) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// Mock participants for demo mode
const MOCK_PARTICIPANTS = [
  { id: '1', name: 'You', isMuted: false, isCamOn: false, isLocal: true },
  { id: '2', name: 'Aarav Shah', isMuted: true, isCamOn: false },
  { id: '3', name: 'Priya Menon', isMuted: false, isCamOn: false },
  { id: '4', name: 'Dev Kapoor', isMuted: false, isCamOn: false },
];

export default function VideoGrid({ remoteUsers = [], isCamOn = false, roomId }) {
  // Build participant list: local + remotes (or mock if no remotes)
  const localUser = { id: 'local', name: 'You', isLocal: true, isCamOn };

  let people;
  if (remoteUsers.length > 0) {
    const remoteParticipants = remoteUsers.map(uid => ({
      id: uid.toString(),
      uid: uid,
      name: `Guest ${uid.toString().slice(-4)}`,
      isLocal: false,
      isCamOn: true,
    }));
    people = [localUser, ...remoteParticipants];
  } else {
    // Demo mode — show mock participants
    people = MOCK_PARTICIPANTS.map(p => ({
      ...p,
      isCamOn: p.isLocal ? isCamOn : p.isCamOn,
    }));
  }

  const count = people.length;
  const cols = count <= 2 ? 1 : 2;
  const cardWidth = (width - 32 - CARD_GAP * (cols - 1)) / cols;
  const cardHeight = count <= 2 ? 160 : 120;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {people.map((p, i) => (
          <VideoCard
            key={p.id}
            participant={p}
            width={count === 1 ? width - 32 : cardWidth}
            height={cardHeight}
            index={i}
            colorIdx={i}
          />
        ))}
      </View>
    </View>
  );
}

function VideoCard({ participant, width: w, height: h, index, colorIdx }) {
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1, friction: 6, tension: 100,
        delay: index * 100, useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1, duration: 400,
        delay: index * 100, useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const { name, isMuted, isCamOn, isLocal, isSpeaking } = participant;
  const colors = AVATAR_COLORS[colorIdx % AVATAR_COLORS.length];
  const initials = getInitials(name);
  const canRenderNativeVideo = isCamOn && RtcSurfaceView && !isLocal ? true : (isCamOn && RtcSurfaceView && isLocal);

  return (
    <Animated.View style={[
      styles.card,
      { width: w, height: h, opacity: opacityAnim, transform: [{ scale: scaleAnim }] },
    ]}>
      <View style={[styles.cardInner, isSpeaking && styles.speaking]}>
        {/* Show native video if Agora SDK available and cam is on */}
        {canRenderNativeVideo ? (
          <View style={styles.videoContainer}>
            <RtcSurfaceView
              style={styles.videoView}
              canvas={{
                uid: isLocal ? 0 : participant.uid,
              }}
            />
          </View>
        ) : (
          /* Professional avatar with initials */
          <View style={styles.avatarArea}>
            <View style={[styles.avatarCircle, { backgroundColor: colors[0] + '25' }]}>
              <Text style={[styles.avatarInitials, { color: colors[0] }]}>{initials}</Text>
            </View>
          </View>
        )}

        {/* Bottom overlay with name */}
        <View style={styles.nameBar}>
          <View style={styles.nameRow}>
            <Text style={styles.nameText} numberOfLines={1}>
              {isLocal ? `${name} (You)` : name}
            </Text>
            <View style={styles.indicators}>
              {isMuted && (
                <View style={styles.mutedBadge}>
                  <Ionicons name="mic-off" size={10} color="#EF4444" />
                </View>
              )}
              {isLocal && (
                <View style={styles.hostBadge}>
                  <Text style={styles.hostText}>HOST</Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Speaking indicator */}
        {isSpeaking && (
          <View style={styles.speakingDots}>
            {[0, 1, 2].map(i => (
              <View key={i} style={[styles.speakingDot, { height: 6 + Math.random() * 6 }]} />
            ))}
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: 'center',
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadows.small,
  },
  cardInner: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.glassBorder,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  speaking: {
    borderColor: Colors.success,
    borderWidth: 2,
  },
  avatarArea: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  videoView: {
    width: '100%',
    height: '100%',
  },
  avatarCircle: {
    width: 52, height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 1,
  },
  nameBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nameText: {
    fontSize: 11,
    color: '#fff',
    fontWeight: '600',
    flex: 1,
  },
  indicators: {
    flexDirection: 'row',
    gap: 4,
  },
  mutedBadge: {
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(239, 68, 68, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hostBadge: {
    backgroundColor: 'rgba(108, 92, 231, 0.5)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 5,
  },
  hostText: {
    fontSize: 7,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  speakingDots: {
    position: 'absolute',
    top: 6,
    right: 6,
    flexDirection: 'row',
    gap: 2,
    alignItems: 'flex-end',
  },
  speakingDot: {
    width: 3,
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
});

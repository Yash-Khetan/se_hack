import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Shadows } from '../theme/colors';

const EMOJIS = ['👍', '❤️', '😂', '🎉', '🔥', '👏'];

export default function MeetingControls({
  isMicOn, isCamOn, isHandRaised,
  onToggleMic, onToggleCam, onRaiseHand,
  onShareScreen, onEndCall, onShowEmoji,
}) {
  const [showEmojis, setShowEmojis] = useState(false);
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const emojiSlide = useRef(new Animated.Value(0)).current;

  const toggleEmojiPanel = () => {
    if (showEmojis) {
      Animated.timing(emojiSlide, { toValue: 0, duration: 200, useNativeDriver: true }).start(
        () => setShowEmojis(false)
      );
    } else {
      setShowEmojis(true);
      Animated.spring(emojiSlide, { toValue: 1, friction: 7, useNativeDriver: true }).start();
    }
  };

  const sendEmoji = (emoji) => {
    const id = Date.now();
    setFloatingEmojis(prev => [...prev, { id, emoji }]);
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 2000);
    if (onShowEmoji) onShowEmoji(emoji);
  };

  return (
    <View style={styles.wrapper}>
      {/* Floating Emojis */}
      {floatingEmojis.map((e) => (
        <FloatingEmoji key={e.id} emoji={e.emoji} />
      ))}

      {/* Emoji Picker */}
      {showEmojis && (
        <Animated.View style={[styles.emojiPicker, {
          opacity: emojiSlide,
          transform: [{
            translateY: emojiSlide.interpolate({
              inputRange: [0, 1], outputRange: [20, 0],
            }),
          }],
        }]}>
          {EMOJIS.map((emoji, i) => (
            <TouchableOpacity key={i} style={styles.emojiBtn} onPress={() => sendEmoji(emoji)}>
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      {/* Controls Bar */}
      <View style={styles.container}>
        <LinearGradient
          colors={['rgba(17, 19, 40, 0.95)', 'rgba(11, 13, 27, 0.98)']}
          style={styles.bar}
        >
          {/* Mic */}
          <ControlButton
            icon={isMicOn ? 'mic' : 'mic-off'}
            label={isMicOn ? 'Mic' : 'Muted'}
            isActive={isMicOn}
            isOff={!isMicOn}
            onPress={onToggleMic}
          />

          {/* Camera */}
          <ControlButton
            icon={isCamOn ? 'videocam' : 'videocam-off'}
            label={isCamOn ? 'Camera' : 'Cam Off'}
            isActive={isCamOn}
            isOff={!isCamOn}
            onPress={onToggleCam}
          />

          {/* Screen Share */}
          <ControlButton
            icon="tv"
            label="Share"
            onPress={onShareScreen}
          />

          {/* Raise Hand */}
          <ControlButton
            icon="hand-left"
            label={isHandRaised ? 'Lower' : 'Raise'}
            isActive={isHandRaised}
            highlight={isHandRaised}
            onPress={onRaiseHand}
          />

          {/* Emoji */}
          <ControlButton
            icon="happy"
            label="React"
            isActive={showEmojis}
            onPress={toggleEmojiPanel}
          />

          {/* End Call */}
          <TouchableOpacity style={styles.endCallBtn} onPress={onEndCall} activeOpacity={0.7}>
            <LinearGradient colors={Colors.gradientDanger} style={styles.endCallGrad}>
              <Ionicons name="call" size={20} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </LinearGradient>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </View>
  );
}

function ControlButton({ icon, label, isActive, isOff, highlight, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.85, duration: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();
    if (onPress) onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity style={styles.controlBtn} onPress={handlePress} activeOpacity={0.7}>
        <View style={[
          styles.controlIcon,
          isOff && styles.controlIconOff,
          highlight && styles.controlIconHighlight,
        ]}>
          <Ionicons
            name={icon}
            size={20}
            color={isOff ? '#EF4444' : highlight ? '#F59E0B' : '#fff'}
          />
        </View>
        <Text style={[styles.controlLabel, isOff && styles.controlLabelOff]}>
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function FloatingEmoji({ emoji }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value((Math.random() - 0.5) * 100)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: -200, duration: 2000, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 2000, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.floatingEmoji, {
      opacity,
      transform: [{ translateY }, { translateX }],
    }]}>
      <Text style={{ fontSize: 28 }}>{emoji}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.xxl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.medium,
  },
  controlBtn: {
    alignItems: 'center',
    gap: 4,
  },
  controlIcon: {
    width: 44, height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIconOff: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  controlIconHighlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
  },
  controlLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    fontSize: 10,
  },
  controlLabelOff: {
    color: '#EF4444',
  },
  endCallBtn: {
    ...Shadows.small,
  },
  endCallGrad: {
    width: 48, height: 44,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiPicker: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 40,
    marginBottom: 8,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
    ...Shadows.medium,
  },
  emojiBtn: {
    width: 40, height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiText: { fontSize: 20 },
  floatingEmoji: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    zIndex: 100,
  },
});

import React, { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, Animated, Dimensions,
} from 'react-native';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

const EMOJIS = ['👍', '❤️', '👏', '😂', '🔥'];

interface FloatingEmoji {
  id: number;
  emoji: string;
  x: number;
  anim: Animated.Value;
}

interface EmojiOverlayProps {
  visible: boolean;
  onClose: () => void;
  onEmojiPress: (emoji: string) => void;
  incomingEmoji?: { emoji: string; userName: string } | null;
}

let emojiCounter = 0;

export default function EmojiOverlay({
  visible, onClose, onEmojiPress, incomingEmoji,
}: EmojiOverlayProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);

  const triggerFloat = useCallback((emoji: string) => {
    const id = ++emojiCounter;
    const x = SCREEN_WIDTH * 0.15 + Math.random() * (SCREEN_WIDTH * 0.7);
    const anim = new Animated.Value(0);

    setFloatingEmojis(prev => [...prev, { id, emoji, x, anim }]);

    Animated.timing(anim, {
      toValue: 1,
      duration: 2200,
      useNativeDriver: true,
    }).start(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    });
  }, []);

  const handleEmojiPress = useCallback((emoji: string) => {
    triggerFloat(emoji);
    onEmojiPress(emoji);
  }, [triggerFloat, onEmojiPress]);

  // React to incoming emojis from other users
  useEffect(() => {
    if (incomingEmoji) {
      triggerFloat(incomingEmoji.emoji);
    }
  }, [incomingEmoji]);

  return (
    <>
      {/* Floating emojis layer */}
      {floatingEmojis.map((fe) => (
        <Animated.Text
          key={fe.id}
          pointerEvents="none"
          style={[
            styles.floatingEmoji,
            {
              left: fe.x,
              transform: [
                {
                  translateY: fe.anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -SCREEN_HEIGHT * 0.55],
                  }),
                },
                {
                  scale: fe.anim.interpolate({
                    inputRange: [0, 0.15, 0.4, 0.85, 1],
                    outputRange: [0.3, 1.4, 1.1, 1.0, 0.4],
                  }),
                },
              ],
              opacity: fe.anim.interpolate({
                inputRange: [0, 0.08, 0.7, 1],
                outputRange: [0, 1, 0.9, 0],
              }),
            },
          ]}
        >
          {fe.emoji}
        </Animated.Text>
      ))}

      {/* Emoji picker panel */}
      {visible && (
        <>
          <TouchableOpacity
            style={styles.pickerBackdrop}
            onPress={onClose}
            activeOpacity={1}
          />
          <View style={styles.pickerContainer}>
            <View style={styles.picker}>
              {EMOJIS.map((emoji, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.emojiButton}
                  onPress={() => handleEmojiPress(emoji)}
                  activeOpacity={0.6}
                >
                  <Text style={styles.emojiText}>{emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  pickerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 98,
  },
  pickerContainer: {
    position: 'absolute',
    bottom: 160,
    alignSelf: 'center',
    zIndex: 100,
  },
  picker: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15,20,35,0.96)',
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.18)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  emojiButton: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  emojiText: { fontSize: 22 },
  floatingEmoji: {
    position: 'absolute',
    bottom: 180,
    fontSize: 34,
    zIndex: 999,
  },
});

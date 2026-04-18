import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Animated, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

const { width, height } = Dimensions.get('window');

export default function AmbientBackground() {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1 Animation (Floating slowly)
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim1, {
          toValue: 1,
          duration: 10000,
          useNativeDriver: true,
        }),
        Animated.timing(anim1, {
          toValue: 0,
          duration: 12000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Orb 2 Animation (Floating in opposite phase)
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim2, {
          toValue: 1,
          duration: 14000,
          useNativeDriver: true,
        }),
        Animated.timing(anim2, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [anim1, anim2]);

  const translateY1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -height * 0.3],
  });
  
  const translateX1 = anim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width * 0.2],
  });

  const translateY2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height * 0.4],
  });
  
  const translateX2 = anim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -width * 0.3],
  });

  return (
    <View style={styles.absoluteFill}>
      <Animated.View
        style={[
          styles.orb,
          styles.orb1,
          {
            transform: [
              { translateY: translateY1 },
              { translateX: translateX1 },
              { scale: anim1.interpolate({ inputRange: [0, 1], outputRange: [1, 1.2] }) }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.theme.accent, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.orb,
          styles.orb2,
          {
            transform: [
              { translateY: translateY2 },
              { translateX: translateX2 },
              { scale: anim2.interpolate({ inputRange: [0, 1], outputRange: [1.2, 1] }) }
            ]
          }
        ]}
      >
        <LinearGradient
          colors={[Colors.theme.accentSecondary, 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
    </View>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  orb: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.6,
  },
  orb1: {
    top: -width * 0.2,
    left: -width * 0.2,
    backgroundColor: Colors.theme.accent,
  },
  orb2: {
    bottom: -width * 0.2,
    right: -width * 0.2,
    backgroundColor: Colors.theme.accentSecondary,
  },
});

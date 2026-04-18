import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/Shared/GradientBackground';
import Header from '@/components/Shared/Header';
import FocusCard from '@/components/Home/FocusCard';
import HeatmapStrip from '@/components/Home/HeatmapStrip';
import AnalyticsCard from '@/components/Home/AnalyticsCard';
import StreakCard from '@/components/Home/StreakCard';
import DailyInsightBar from '@/components/Home/DailyInsightBar';
import ProfileDrawer from '@/components/Shared/ProfileDrawer';

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = useState(false);

  // Stagger entrance animations
  const fadeAnims = useRef([
    new Animated.Value(0), // Header
    new Animated.Value(0), // DailyInsightBar
    new Animated.Value(0), // FocusCard
    new Animated.Value(0), // HeatmapStrip
    new Animated.Value(0), // AnalyticsCard
    new Animated.Value(0), // StreakCard
  ]).current;

  const slideAnims = useRef([
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
  ]).current;

  useEffect(() => {
    const animations = fadeAnims.map((fadeAnim, index) =>
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnims[index], {
          toValue: 0,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }),
      ])
    );
    Animated.stagger(0, animations).start();
  }, [fadeAnims, slideAnims]);

  const animatedStyle = (index: number) => ({
    opacity: fadeAnims[index],
    transform: [{ translateY: slideAnims[index] }],
  });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={animatedStyle(0)}>
          <Header
            title="Good Evening, Miti 👋"
            subtitle="Fri, 18th Apr"
            onProfilePress={() => setDrawerVisible(true)}
          />
        </Animated.View>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={animatedStyle(1)}>
            <DailyInsightBar />
          </Animated.View>
          <Animated.View style={animatedStyle(2)}>
            <FocusCard />
          </Animated.View>
          <Animated.View style={animatedStyle(3)}>
            <HeatmapStrip />
          </Animated.View>
          <Animated.View style={animatedStyle(4)}>
            <AnalyticsCard />
          </Animated.View>
          <Animated.View style={animatedStyle(5)}>
            <StreakCard />
          </Animated.View>
        </ScrollView>

        <ProfileDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      </SafeAreaView>
    </GradientBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
});

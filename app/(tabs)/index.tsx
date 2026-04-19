import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, ScrollView, Animated, TouchableOpacity, View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/Shared/GradientBackground';
import Header from '@/components/Shared/Header';
import AnalyticsCard from '@/components/Home/AnalyticsCard';
import StreakCard from '@/components/Home/StreakCard';
import DailyInsightBar from '@/components/Home/DailyInsightBar';
import ProfileDrawer from '@/components/Shared/ProfileDrawer';
import { useRouter } from 'expo-router';
import { useUser } from '@/context/UserContext';
import { useTheme } from '@/context/ThemeContext';
import { Mail, Calendar as CalendarIcon, ChevronRight } from 'lucide-react-native';

export default function HomeScreen() {
  const { profile } = useUser();
  const router = useRouter();
  const { colors } = useTheme();
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

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';
  const displayDate = currentTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  
  // Format time as HH:mm:ss 24hr format
  const displayTime = currentTime.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <Animated.View style={animatedStyle(0)}>
          <Header
            title={`${greeting}, ${profile.name} 👋`}
            subtitle={`${displayDate}  •  ${displayTime}`}
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
          
          <Animated.View style={[animatedStyle(2), styles.dualPortalRow]}>
            <TouchableOpacity 
              style={[styles.portalBox, { backgroundColor: colors.cardSolid, borderColor: colors.border }]} 
              onPress={() => router.push('/emails')}
              activeOpacity={0.8}
            >
              <View style={styles.portalIconWrapper}>
                <Mail size={22} color={colors.accent} />
              </View>
              <Text style={[styles.portalTitle, { color: colors.textMuted }]}>Email Sync</Text>
              <Text style={[styles.portalSubtitle, { color: colors.text }]} numberOfLines={1}>
                {profile.email || 'Not connected'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.portalBox, { backgroundColor: colors.cardSolid, borderColor: colors.border }]} 
              onPress={() => router.push('/stress-heatmap')}
              activeOpacity={0.8}
            >
              <View style={[styles.portalIconWrapper, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                <CalendarIcon size={22} color="#10B981" />
              </View>
              <Text style={[styles.portalTitle, { color: colors.textMuted }]}>Calendar</Text>
              
              <View style={styles.miniHeatmapRow}>
                {['#10B981', '#F59E0B', '#EF4444', '#10B981', '#10B981', '#64748B', '#F59E0B'].map((color, i) => (
                  <View key={i} style={[styles.miniDot, { backgroundColor: color }]} />
                ))}
              </View>

              <View style={styles.portalActionRow}>
                <Text style={[styles.portalSubtitle, { color: colors.text }]}>View Heatmap</Text>
                <ChevronRight size={16} color={colors.textMuted} />
              </View>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={animatedStyle(3)}>
            <AnalyticsCard />
          </Animated.View>
          <Animated.View style={animatedStyle(4)}>
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
  dualPortalRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  portalBox: {
    flex: 1,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  portalIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  portalTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  portalSubtitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  portalActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniHeatmapRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 12,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

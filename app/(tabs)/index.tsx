import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GradientBackground from '@/components/Shared/GradientBackground';
import Header from '@/components/Shared/Header';
import FocusCard from '@/components/Home/FocusCard';
import HeatmapStrip from '@/components/Home/HeatmapStrip';
import ActionButtons from '@/components/Home/ActionButtons';
import AnalyticsCard from '@/components/Home/AnalyticsCard';
import SquadPreview from '@/components/Home/SquadPreview';
import ProfileDrawer from '@/components/Shared/ProfileDrawer';

export default function HomeScreen() {
  const [drawerVisible, setDrawerVisible] = React.useState(false);

  const handleProfilePress = () => {
    setDrawerVisible(true);
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.safeArea}>
        <Header 
          title="Good Evening, Miti 👋" 
          subtitle="Mon, 12th Oct" 
          onProfilePress={handleProfilePress} 
        />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FocusCard />
          <HeatmapStrip />
          <ActionButtons />
          <AnalyticsCard />
          <SquadPreview />
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
    paddingBottom: 40,
  },
});

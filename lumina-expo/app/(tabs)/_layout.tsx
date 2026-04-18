import { Tabs } from 'expo-router';
import Svg, { Path, Circle, Line, Polygon } from 'react-native-svg';

const C = {
  olive: '#8FA071', muted: '#A0988F',
  surface: '#221A14', border: 'rgba(160,152,143,0.15)',
};

// rect(x,y,w,h) as Path — no Rect needed
const R = (x: number, y: number, w: number, h: number) =>
  `M${x},${y} L${x+w},${y} L${x+w},${y+h} L${x},${y+h} Z`;

function DashIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22">
      <Path d={R(2,2,8,8)} fill={color} />
      <Path d={R(12,2,8,8)} fill={color} opacity={0.55} />
      <Path d={R(2,12,8,8)} fill={color} opacity={0.55} />
      <Path d={R(12,12,8,8)} fill={color} opacity={0.3} />
    </Svg>
  );
}

function TimeIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22">
      <Circle cx="11" cy="11" r="9" stroke={color} strokeWidth="1.8" fill="none" />
      <Line x1="11" y1="5" x2="11" y2="11" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Line x1="11" y1="11" x2="15" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="11" cy="11" r="1.5" fill={color} />
    </Svg>
  );
}

function FocusIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22">
      <Polygon points="11,2 20,20 2,20" fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
      <Line x1="11" y1="8" x2="11" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <Circle cx="11" cy="17" r="1.2" fill={color} />
    </Svg>
  );
}

function HubIcon({ color }: { color: string }) {
  return (
    <Svg width="22" height="22" viewBox="0 0 22 22">
      <Path d="M3 5 Q3 3 5 3 L17 3 Q19 3 19 5 L19 13 Q19 15 17 15 L12 15 L8 19 L8 15 L5 15 Q3 15 3 13 Z"
        fill="none" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
    </Svg>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#16100B' },
        headerShadowVisible: false,
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: '700', letterSpacing: -0.5 },
        tabBarStyle: {
          backgroundColor: C.surface,
          borderTopWidth: 1, borderTopColor: C.border,
          height: 64, paddingBottom: 8, paddingTop: 6,
        },
        tabBarActiveTintColor: C.olive,
        tabBarInactiveTintColor: C.muted,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      }}>
      <Tabs.Screen name="index" options={{ headerTitle: 'Lumina', tabBarLabel: 'Home', tabBarIcon: ({ color }) => <DashIcon color={color} /> }} />
      <Tabs.Screen name="timetable" options={{ headerTitle: 'Attendance', tabBarLabel: 'Attend', tabBarIcon: ({ color }) => <TimeIcon color={color} /> }} />
      <Tabs.Screen name="focus" options={{ headerTitle: 'ContextSwitch', tabBarLabel: 'Focus', tabBarIcon: ({ color }) => <FocusIcon color={color} /> }} />
      <Tabs.Screen name="hub" options={{ headerTitle: 'Group Hub', tabBarLabel: 'Hub', tabBarIcon: ({ color }) => <HubIcon color={color} /> }} />
    </Tabs>
  );
}

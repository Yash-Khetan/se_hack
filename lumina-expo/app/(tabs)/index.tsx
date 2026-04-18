import { ScrollView, View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Polygon, Line, Defs, RadialGradient, Stop, LinearGradient as SvgLinear, Ellipse } from 'react-native-svg';
import { useState, useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

const C = {
  bg: '#16100B', surface: '#221A14', surface2: '#2C2018',
  white: '#FFFFFF', muted: '#A0988F',
  olive: '#8FA071', terra: '#D37B40', purple: '#8D7AE6', yellow: '#EBC352',
  button: '#6A4331', border: 'rgba(160,152,143,0.15)', red: '#C0392B',
};

// Helper: rect as SVG Path
const RP = (x: number, y: number, w: number, h: number, rx = 0) => {
  if (rx === 0) return `M${x},${y} L${x+w},${y} L${x+w},${y+h} L${x},${y+h} Z`;
  return `M${x+rx},${y} L${x+w-rx},${y} Q${x+w},${y} ${x+w},${y+rx} L${x+w},${y+h-rx} Q${x+w},${y+h} ${x+w-rx},${y+h} L${x+rx},${y+h} Q${x},${y+h} ${x},${y+h-rx} L${x},${y+rx} Q${x},${y} ${x+rx},${y} Z`;
};

// Premium spark icon
function SparkIcon({ color, size = 13 }: { color: string; size?: number }) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 14 14">
      <Path d="M7 0 L8.2 5.8 L14 7 L8.2 8.2 L7 14 L5.8 8.2 L0 7 L5.8 5.8 Z" fill={color} />
    </Svg>
  );
}

// Shield check icon
function ShieldIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      <Path d="M9 2 L15 4.5 L15 9 C15 13 9 16 9 16 C9 16 3 13 3 9 L3 4.5 Z"
        fill={color} opacity={0.18} stroke={color} strokeWidth="1.2" strokeLinejoin="round" />
      <Path d="M6 9 L8.2 11.2 L12.5 7" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </Svg>
  );
}

// Pulsing 3D health sphere
function HealthSphere({ score }: { score: number }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const color = score >= 75 ? C.olive : score >= 65 ? C.terra : C.red;
  const lit = score >= 75 ? '#B8D4A0' : score >= 65 ? '#E8A060' : '#D06050';

  useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.07, duration: 2000, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 2000, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ scale: pulse }] }}>
      <Svg width={108} height={108} viewBox="0 0 108 108">
        <Defs>
          <RadialGradient id="sph" cx="36%" cy="30%" r="65%">
            <Stop offset="0%" stopColor={lit} />
            <Stop offset="52%" stopColor={color} />
            <Stop offset="100%" stopColor="#0E0700" />
          </RadialGradient>
          <RadialGradient id="sp2" cx="30%" cy="26%" r="28%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Ellipse cx="54" cy="102" rx="32" ry="5" fill="#000" opacity={0.28} />
        <Circle cx="54" cy="50" r="46" fill="url(#sph)" />
        <Circle cx="54" cy="50" r="46" fill="url(#sp2)" />
      </Svg>
    </Animated.View>
  );
}

// Attendance ring
function AttRing({ pct, color }: { pct: number; color: string }) {
  const R = 20, circ = 2 * Math.PI * R;
  const offset = circ - (pct / 100) * circ;
  return (
    <Svg width={50} height={50} viewBox="0 0 50 50">
      <Circle cx="25" cy="25" r={R} fill="none" stroke={C.surface2} strokeWidth="5" />
      <Circle cx="25" cy="25" r={R} fill="none"
        stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 25 25)" />
    </Svg>
  );
}

const insights = [
  'CN Theory at 58% — attend next 4 to recover.',
  '14 app switches today. Cognitive debt climbing.',
  'DBMS Assignment due tonight 11:59 PM.',
  'Spent ₹380 on coffee this week.',
];

const attendance = [
  { subject: 'Data Structures', pct: 80, canBunk: 4 },
  { subject: 'DBMS', pct: 72, canBunk: 1 },
  { subject: 'OS Lab', pct: 64, canBunk: -2 },
  { subject: 'Compiler Design', pct: 78, canBunk: 3 },
  { subject: 'CN Theory', pct: 58, canBunk: -5 },
];

export default function DashboardScreen() {
  const [insightIdx, setInsightIdx] = useState(0);
  const [time, setTime] = useState(new Date());
  const fade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      Animated.sequence([
        Animated.timing(fade, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fade, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start();
      setInsightIdx(i => (i + 1) % insights.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const overallPct = Math.round(attendance.reduce((s, a) => s + a.pct, 0) / attendance.length);
  const scoreColor = overallPct >= 75 ? C.olive : overallPct >= 65 ? C.terra : C.red;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 70 }}>

      {/* Hero */}
      <View style={s.heroCard}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <SparkIcon color={C.olive} size={11} />
            <Text style={{ color: C.olive, fontSize: 10, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' }}>Lumina</Text>
          </View>
          <Text style={{ color: C.muted, fontSize: 13, marginBottom: 2 }}>{greeting},</Text>
          <Text style={s.heroName}>Renee</Text>
          <View style={s.urgentChip}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: C.terra, marginRight: 6 }} />
            <Text style={{ color: C.terra, fontSize: 11, fontWeight: '600' }}>OS Lab viva · tomorrow 9 AM</Text>
          </View>
        </View>
        <View style={{ alignItems: 'center' }}>
          <HealthSphere score={overallPct} />
          <Text style={{ color: scoreColor, fontWeight: '800', fontSize: 15, marginTop: 2 }}>{overallPct}%</Text>
          <Text style={{ color: C.muted, fontSize: 9, letterSpacing: 0.5, textTransform: 'uppercase' }}>Health</Text>
        </View>
      </View>

      {/* Live clock */}
      <View style={s.clockCard}>
        <Text style={s.clockText}>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
        <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', marginTop: 3 }}>
          {time.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
      </View>

      {/* Lumina AI insight */}
      <View style={s.insightCard}>
        <View style={s.insightIcon}><SparkIcon color="#fff" /></View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ color: C.olive, fontSize: 10, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 3 }}>Lumina Insight</Text>
          <Animated.Text style={{ color: C.white, fontSize: 13, lineHeight: 19, opacity: fade }}>
            {insights[insightIdx]}
          </Animated.Text>
        </View>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Cog. Debt', value: '6.4', color: C.terra },
          { label: 'Tasks', value: '12/22', color: C.olive },
          { label: 'Streak', value: '5d', color: C.purple },
        ].map(stat => (
          <View key={stat.label} style={[s.statBox, { borderColor: `${stat.color}22` }]}>
            <SparkIcon color={stat.color} size={10} />
            <Text style={{ color: stat.color, fontSize: 19, fontWeight: '800', marginTop: 4 }}>{stat.value}</Text>
            <Text style={{ color: C.muted, fontSize: 9, marginTop: 3, textAlign: 'center' }}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Attendance */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 6 }}>
        <ShieldIcon color={C.olive} />
        <Text style={s.sectionLabel}>Attendance</Text>
      </View>
      {attendance.map((a) => {
        const col = a.pct >= 75 ? C.olive : a.pct >= 65 ? C.terra : C.red;
        return (
          <View key={a.subject} style={s.attRow}>
            <AttRing pct={a.pct} color={col} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>{a.subject}</Text>
              <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{a.pct}% attended</Text>
            </View>
            <View style={[s.bunkChip, { backgroundColor: `${col}18`, borderColor: `${col}30` }]}>
              <Text style={{ color: col, fontSize: 11, fontWeight: '800' }}>
                {a.canBunk > 0 ? `+${a.canBunk}` : `${a.canBunk}`}
              </Text>
            </View>
          </View>
        );
      })}

      {/* Deadlines */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 14, marginBottom: 12, gap: 6 }}>
        <Svg width={16} height={16} viewBox="0 0 16 16">
          <Circle cx="8" cy="8" r="6.5" fill="none" stroke={C.terra} strokeWidth="1.3" />
          <Line x1="8" y1="5" x2="8" y2="9" stroke={C.terra} strokeWidth="1.5" strokeLinecap="round" />
          <Circle cx="8" cy="11.2" r="0.8" fill={C.terra} />
        </Svg>
        <Text style={s.sectionLabel}>Deadlines</Text>
      </View>
      {[
        { label: 'DBMS Assignment', time: 'Tonight · 11:59 PM', urgent: true },
        { label: 'OS Lab Viva', time: 'Tomorrow · 9 AM', urgent: true },
        { label: 'Mid-Sem: Compiler Design', time: 'Apr 22 · 9 AM', urgent: false },
        { label: 'Project Sync Meet', time: 'Apr 19 · 4 PM', urgent: false },
      ].map((item, i) => (
        <View key={i} style={[s.deadlineItem, item.urgent && { borderColor: `${C.terra}30`, backgroundColor: `${C.terra}06` }]}>
          <View style={[s.deadlineDot, { backgroundColor: item.urgent ? C.terra : C.muted }]} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: item.urgent ? C.terra : C.white, fontWeight: '600', fontSize: 13 }}>{item.label}</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 2 }}>{item.time}</Text>
          </View>
          {item.urgent && (
            <Svg width={14} height={14} viewBox="0 0 14 14">
              <Polygon points="7,1 13,13 1,13" fill="none" stroke={C.terra} strokeWidth="1.3" strokeLinejoin="round" />
              <Line x1="7" y1="5.5" x2="7" y2="9" stroke={C.terra} strokeWidth="1.4" strokeLinecap="round" />
              <Circle cx="7" cy="10.8" r="0.7" fill={C.terra} />
            </Svg>
          )}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  heroCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 14 },
  heroName: { color: C.white, fontSize: 30, fontWeight: '800', letterSpacing: -0.8, marginBottom: 10 },
  urgentChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${C.terra}12`, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: `${C.terra}25`, alignSelf: 'flex-start' },
  clockCard: { backgroundColor: C.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, marginBottom: 14, alignItems: 'center' },
  clockText: { color: C.white, fontSize: 40, fontWeight: '800', letterSpacing: -1.5 },
  insightCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: `${C.olive}28`, marginBottom: 20 },
  insightIcon: { width: 28, height: 28, borderRadius: 8, backgroundColor: C.button, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  statBox: { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 14, alignItems: 'center', borderWidth: 1 },
  attRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  bunkChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1, minWidth: 36, alignItems: 'center' },
  deadlineItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: C.border },
  deadlineDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
});

import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import Svg, { Circle, Path, Line, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import { useState, useRef, useEffect } from 'react';

const { width } = Dimensions.get('window');
const C = {
  bg: '#16100B', surface: '#221A14', surface2: '#2C2018',
  white: '#FFFFFF', muted: '#A0988F',
  olive: '#8FA071', terra: '#D37B40', purple: '#8D7AE6', yellow: '#EBC352',
  button: '#6A4331', border: 'rgba(160,152,143,0.15)', red: '#C0392B',
};

// rect as Path
const RP = (x: number, y: number, w: number, h: number, rx = 0) => {
  if (rx === 0) return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x} ${y+h} Z`;
  return `M${x+rx} ${y} L${x+w-rx} ${y} Q${x+w} ${y} ${x+w} ${y+rx} L${x+w} ${y+h-rx} Q${x+w} ${y+h} ${x+w-rx} ${y+h} L${x+rx} ${y+h} Q${x} ${y+h} ${x} ${y+h-rx} L${x} ${y+rx} Q${x} ${y} ${x+rx} ${y} Z`;
};

function FlagIcon({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 15 15">
      <Line x1="3" y1="2" x2="3" y2="13" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      <Path d="M3 2 L12 4.8 L10.2 8.6 L3 8.6 Z" fill={color} opacity={0.85} />
    </Svg>
  );
}

// 3D stacked doc icon — using Path only
function DocStack({ color }: { color: string }) {
  return (
    <Svg width={42} height={42} viewBox="0 0 42 42">
      <Defs>
        <SvgLinear id="d1" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <Stop offset="100%" stopColor={color} stopOpacity="0.35" />
        </SvgLinear>
      </Defs>
      {/* Back slab */}
      <Path d={RP(13, 22, 22, 14, 3)} fill={C.surface2} stroke={C.border} strokeWidth="0.8" />
      {/* Mid slab */}
      <Path d={RP(8, 15, 22, 14, 3)} fill={C.surface} stroke={`${color}28`} strokeWidth="0.8" />
      {/* Front slab */}
      <Path d={RP(3, 8, 22, 14, 3)} fill="url(#d1)" />
      <Line x1="7" y1="14" x2="21" y2="14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity={0.45} />
      <Line x1="7" y1="18" x2="18" y2="18" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" opacity={0.28} />
    </Svg>
  );
}

function AnimatedBar({ pct, color }: { pct: number; color: string }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: pct / 100, duration: 900, useNativeDriver: false, delay: 200 }).start();
  }, [pct]);
  const barW = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ height: 6, backgroundColor: C.surface2, borderRadius: 3, overflow: 'hidden', marginTop: 10, marginBottom: 6 }}>
      <Animated.View style={{ width: barW as any, height: '100%', backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

const subjects = [
  { name: 'Data Structures & Algos', attended: 35, total: 42, credits: 4, lab: false },
  { name: 'DBMS', attended: 28, total: 38, credits: 3, lab: false },
  { name: 'OS Lab', attended: 8, total: 12, credits: 1.5, lab: true },
  { name: 'Compiler Design', attended: 33, total: 40, credits: 3, lab: false },
  { name: 'Computer Networks', attended: 21, total: 36, credits: 3, lab: false },
];

function getStatus(attended: number, total: number) {
  const pct = Math.round((attended / total) * 100);
  const needed = Math.ceil(0.75 * total);
  const canBunk = attended - needed;
  const reqMore = canBunk < 0 ? Math.ceil((needed - attended) / 0.25) : 0;
  const color = pct >= 75 ? C.olive : pct >= 65 ? C.terra : C.red;
  return { pct, canBunk, reqMore, color };
}

export default function TimetableScreen() {
  const [uploaded, setUploaded] = useState(false);
  const [markLog, setMarkLog] = useState<Record<string, 'present' | 'absent'>>({});

  const toggleMark = (name: string, val: 'present' | 'absent') =>
    setMarkLog(p => ({ ...p, [name]: p[name] === val ? undefined! : val }));

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 64 }}>

      {!uploaded ? (
        <View style={s.uploadCard}>
          {/* 3D doc upload icon — all Path */}
          <Svg width={68} height={68} viewBox="0 0 68 68" style={{ marginBottom: 14 }}>
            <Defs>
              <SvgLinear id="oc" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={C.olive} stopOpacity="0.9" />
                <Stop offset="100%" stopColor={C.olive} stopOpacity="0.35" />
              </SvgLinear>
            </Defs>
            <Path d={RP(24, 36, 30, 22, 4)} fill={C.surface2} stroke={C.border} strokeWidth="1" />
            <Path d={RP(15, 26, 30, 22, 4)} fill={C.surface} stroke={`${C.olive}28`} strokeWidth="1" />
            <Path d={RP(6, 14, 30, 22, 4)} fill="url(#oc)" />
            <Line x1="12" y1="22" x2="30" y2="22" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity={0.5} />
            <Line x1="12" y1="27" x2="26" y2="27" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity={0.3} />
            <Path d="M50 46 L50 60 M45.5 50.5 L50 46 L54.5 50.5" stroke={C.olive} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          <Text style={{ color: C.white, fontSize: 16, fontWeight: '700', marginBottom: 6 }}>Upload Timetable</Text>
          <Text style={{ color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 20, maxWidth: 240 }}>
            Lumina OCR reads your PDF or photo and auto-builds your schedule
          </Text>
          <TouchableOpacity style={s.primaryBtn} onPress={() => setUploaded(true)}>
            <Text style={s.primaryBtnText}>Select File</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.successBanner}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Circle cx="9" cy="9" r="8" fill={C.olive} opacity={0.18} />
            <Path d="M5 9.5 L7.8 12.3 L13.5 6.5" stroke={C.olive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
          <Text style={{ color: C.olive, fontWeight: '700', fontSize: 13, marginLeft: 8 }}>5 subjects parsed from timetable</Text>
        </View>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, marginTop: 4 }}>
        <FlagIcon color={C.terra} />
        <Text style={s.sectionLabel}>Bunk Analytics</Text>
      </View>

      {subjects.map((sub) => {
        const { pct, canBunk, reqMore, color } = getStatus(sub.attended, sub.total);
        const markedPresent = markLog[sub.name] === 'present';
        const markedAbsent = markLog[sub.name] === 'absent';

        return (
          <View key={sub.name} style={s.subjectCard}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 }}>
              <DocStack color={color} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={{ color: C.white, fontWeight: '700', fontSize: 14, lineHeight: 19 }}>{sub.name}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>
                  {sub.attended}/{sub.total} · {sub.credits} cr{sub.lab ? ' · Lab' : ''}
                </Text>
              </View>
              <Text style={{ color, fontWeight: '800', fontSize: 22 }}>{pct}%</Text>
            </View>

            <AnimatedBar pct={pct} color={color} />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8 }}>
              <Text style={{ color: C.muted, fontSize: 9 }}>75% target</Text>
            </View>

            <View style={[s.statusPill, { backgroundColor: `${color}10`, borderColor: `${color}28` }]}>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: color, marginRight: 6 }} />
              <Text style={{ color, fontSize: 12, fontWeight: '600' }}>
                {canBunk > 0 ? `Can skip ${canBunk} more` : `Attend ${reqMore} more to recover`}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <TouchableOpacity
                style={[s.markBtn, markedPresent && { backgroundColor: `${C.olive}18`, borderColor: C.olive }]}
                onPress={() => toggleMark(sub.name, 'present')}>
                <Svg width={11} height={11} viewBox="0 0 11 11">
                  <Path d="M1.5 5.5 L4 8 L9.5 2.5" stroke={C.olive} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
                <Text style={{ color: C.olive, fontSize: 11, fontWeight: '700', marginLeft: 5 }}>Present</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.markBtn, markedAbsent && { backgroundColor: `${C.red}18`, borderColor: C.red }]}
                onPress={() => toggleMark(sub.name, 'absent')}>
                <Svg width={11} height={11} viewBox="0 0 11 11">
                  <Line x1="2" y1="2" x2="9" y2="9" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" />
                  <Line x1="9" y1="2" x2="2" y2="9" stroke={C.red} strokeWidth="1.8" strokeLinecap="round" />
                </Svg>
                <Text style={{ color: C.red, fontSize: 11, fontWeight: '700', marginLeft: 5 }}>Absent</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}

      <View style={s.summaryRow}>
        {[{ l: 'Classes Today', v: '4', c: C.white }, { l: 'Safe Bunks', v: '8', c: C.olive }, { l: 'At Risk', v: '2', c: C.red }].map(st => (
          <View key={st.l} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: st.c, fontSize: 22, fontWeight: '800' }}>{st.v}</Text>
            <Text style={{ color: C.muted, fontSize: 10, marginTop: 3 }}>{st.l}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  uploadCard: { backgroundColor: C.surface, borderRadius: 20, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: `${C.olive}22`, marginBottom: 24 },
  successBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: `${C.olive}10`, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: `${C.olive}20`, marginBottom: 20 },
  primaryBtn: { backgroundColor: C.button, borderRadius: 99, paddingVertical: 12, paddingHorizontal: 32 },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  subjectCard: { backgroundColor: C.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  statusPill: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, alignSelf: 'flex-start' },
  markBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border, backgroundColor: C.surface2 },
  summaryRow: { flexDirection: 'row', backgroundColor: C.surface, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: C.border, marginTop: 8 },
});

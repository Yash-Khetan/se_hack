import { ScrollView, View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Svg, { Circle, Path, Polygon, Line, Defs, LinearGradient as SvgLinear, Stop, Ellipse } from 'react-native-svg';
import { useState, useEffect, useRef } from 'react';

const C = {
  bg: '#16100B', surface: '#221A14', surface2: '#2C2018',
  white: '#FFFFFF', muted: '#A0988F',
  olive: '#8FA071', terra: '#D37B40', purple: '#8D7AE6', yellow: '#EBC352',
  button: '#6A4331', border: 'rgba(160,152,143,0.15)', red: '#C0392B',
};

// 3D Pyramid — debt visualizer (no Rect)
function DebtPyramid({ score }: { score: number }) {
  const color = score > 7 ? C.red : score > 4 ? C.terra : C.olive;
  const lit   = score > 7 ? '#E07060' : score > 4 ? '#E89060' : '#A0C880';
  return (
    <Svg width={130} height={130} viewBox="0 0 130 130">
      <Defs>
        <SvgLinear id="pyL" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={lit} />
          <Stop offset="100%" stopColor="#100A00" />
        </SvgLinear>
        <SvgLinear id="pyR" x1="1" y1="0" x2="0" y2="1">
          <Stop offset="0%" stopColor={color} stopOpacity="0.75" />
          <Stop offset="100%" stopColor="#100A00" />
        </SvgLinear>
      </Defs>
      <Ellipse cx="65" cy="124" rx="40" ry="6" fill="#000" opacity={0.28} />
      <Polygon points="65,14 22,118 65,118" fill="url(#pyL)" />
      <Polygon points="65,14 108,118 65,118" fill="url(#pyR)" />
      <Polygon points="65,14 22,118 108,118" fill="none" stroke={color} strokeWidth="0.8" strokeOpacity="0.3" />
    </Svg>
  );
}

// Pomodoro ring timer
function TimerRing({ elapsed, duration, color }: { elapsed: number; duration: number; color: string }) {
  const R = 66, circ = 2 * Math.PI * R;
  const offset = circ * (1 - elapsed / duration);
  return (
    <Svg width={160} height={160} viewBox="0 0 160 160">
      <Circle cx="80" cy="80" r={R} fill="none" stroke={C.surface2} strokeWidth="8" />
      <Circle cx="80" cy="80" r={R} fill="none"
        stroke={color} strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform="rotate(-90 80 80)" />
      {[0, 5, 10, 15, 20].map(i => {
        const ang = (i / 25) * 360 - 90;
        const rad = (ang * Math.PI) / 180;
        const x1 = 80 + 72 * Math.cos(rad), y1 = 80 + 72 * Math.sin(rad);
        const x2 = 80 + 78 * Math.cos(rad), y2 = 80 + 78 * Math.sin(rad);
        return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={C.border} strokeWidth="2" strokeLinecap="round" />;
      })}
    </Svg>
  );
}

function TimelineIcon({ type, color }: { type: string; color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 18 18">
      {type === 'social' && (<><Circle cx="9" cy="7" r="3.5" fill="none" stroke={color} strokeWidth="1.4" /><Path d="M3 17 C3 13 15 13 15 17" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none" /></>)}
      {type === 'msg' && (<Path d="M2 4 Q2 2 4 2 L14 2 Q16 2 16 4 L16 11 Q16 13 14 13 L10 13 L7 16 L7 13 L4 13 Q2 13 2 11 Z" fill="none" stroke={color} strokeWidth="1.4" strokeLinejoin="round" />)}
      {type === 'code' && (<><Path d="M5 6 L2 9 L5 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><Path d="M13 6 L16 9 L13 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /><Line x1="10" y1="4" x2="8" y2="14" stroke={color} strokeWidth="1.3" strokeLinecap="round" /></>)}
      {type === 'video' && (<><Path d="M2 5 Q2 4 3 4 L11 4 Q12 4 12 5 L12 13 Q12 14 11 14 L3 14 Q2 14 2 13 Z" fill="none" stroke={color} strokeWidth="1.4" /><Polygon points="12,7 16,9 12,11" fill={color} opacity={0.85} /></>)}
    </Svg>
  );
}

const timeline = [
  { app: 'Instagram', mins: '8 min', debtDelta: '+1.4', color: C.red,    ago: '2m ago',  icon: 'social' },
  { app: 'WhatsApp',  mins: '4 min', debtDelta: '+0.7', color: C.terra,  ago: '14m ago', icon: 'msg'    },
  { app: 'VS Code',   mins: '22 min',debtDelta: '−1.2', color: C.olive,  ago: '36m ago', icon: 'code'   },
  { app: 'YouTube',   mins: '12 min',debtDelta: '+2.1', color: C.purple, ago: '58m ago', icon: 'video'  },
];

export default function FocusScreen() {
  const [active, setActive]   = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [mode, setMode]       = useState<'focus' | 'break'>('focus');
  const DURATION = mode === 'focus' ? 25 * 60 : 5 * 60;
  const debtScore = 6.4;
  const debtColor = debtScore > 7 ? C.red : debtScore > 4 ? C.terra : C.olive;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (active) {
      interval = setInterval(() => {
        setElapsed(e => { if (e >= DURATION - 1) { setActive(false); return 0; } return e + 1; });
      }, 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [active, DURATION]);

  useEffect(() => {
    if (active) {
      Animated.loop(Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1,    duration: 1000, useNativeDriver: true }),
      ])).start();
    } else { pulse.setValue(1); }
  }, [active]);

  const timeLeft = DURATION - elapsed;
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const secs = String(timeLeft % 60).padStart(2, '0');
  const ringColor = mode === 'focus' ? C.olive : C.terra;

  return (
    <ScrollView style={s.container} contentContainerStyle={{ padding: 20, paddingBottom: 64 }}>

      {/* Debt hero */}
      <View style={s.heroCard}>
        <View style={{ flex: 1, paddingRight: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Svg width={12} height={12} viewBox="0 0 12 12">
              <Polygon points="6,1 11,11 1,11" fill={debtColor} opacity={0.9} />
            </Svg>
            <Text style={{ color: C.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' }}>Cognitive Debt</Text>
          </View>
          <Text style={{ color: debtColor, fontSize: 52, fontWeight: '800', letterSpacing: -2, lineHeight: 56 }}>{debtScore}</Text>
          <Text style={{ color: C.muted, fontSize: 11, marginBottom: 12 }}>out of 10</Text>
          <View style={[s.debtPill, { backgroundColor: `${debtColor}14`, borderColor: `${debtColor}30` }]}>
            <Text style={{ color: debtColor, fontSize: 11, fontWeight: '700' }}>
              {debtScore > 7 ? 'Critical — take a break' : debtScore > 4 ? 'Moderate load' : 'Healthy'}
            </Text>
          </View>
        </View>
        <DebtPyramid score={debtScore} />
      </View>

      {/* Gradient meter bar */}
      <View style={{ marginBottom: 24 }}>
        <View style={{ height: 10, borderRadius: 5, overflow: 'hidden', backgroundColor: C.surface2, flexDirection: 'row' }}>
          <View style={{ flex: 1, backgroundColor: C.olive, opacity: 0.7 }} />
          <View style={{ flex: 1, backgroundColor: C.yellow, opacity: 0.7 }} />
          <View style={{ flex: 1, backgroundColor: C.terra, opacity: 0.7 }} />
          <View style={{ flex: 1, backgroundColor: C.red, opacity: 0.7 }} />
        </View>
        {/* Indicator pin */}
        <View style={{ alignItems: 'flex-start', paddingLeft: `${Math.min((debtScore / 10) * 100, 96)}%` as any, marginTop: 3 }}>
          <View style={s.meterPin} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
          <Text style={{ color: C.muted, fontSize: 9 }}>Recovered</Text>
          <Text style={{ color: C.muted, fontSize: 9 }}>Critical</Text>
        </View>
      </View>

      {/* Pomodoro */}
      <View style={s.timerCard}>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {(['focus', 'break'] as const).map(m => (
            <TouchableOpacity key={m} onPress={() => { setMode(m); setElapsed(0); setActive(false); }}
              style={[s.modePill, mode === m && { backgroundColor: C.surface2, borderColor: ringColor }]}>
              <Text style={{ color: mode === m ? C.white : C.muted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Animated.View style={{ alignItems: 'center', transform: [{ scale: pulse }] }}>
          <TimerRing elapsed={elapsed} duration={DURATION} color={ringColor} />
          <View style={s.timerOverlay}>
            <Text style={[s.timerText, { color: ringColor }]}>{mins}:{secs}</Text>
            <Text style={{ color: C.muted, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 }}>{mode}</Text>
          </View>
        </Animated.View>

        <View style={{ flexDirection: 'row', gap: 12, justifyContent: 'center', marginTop: 16 }}>
          <TouchableOpacity
            style={[s.ctrlBtn, active ? { backgroundColor: `${C.red}16`, borderColor: `${C.red}35` } : { backgroundColor: C.button, borderColor: 'transparent' }]}
            onPress={() => setActive(!active)}>
            <Svg width={18} height={18} viewBox="0 0 18 18">
              {active
                ? <><Path d="M3 3 L7 3 L7 15 L3 15 Z" fill={C.red} /><Path d="M11 3 L15 3 L15 15 L11 15 Z" fill={C.red} /></>
                : <Polygon points="3.5,2 16,9 3.5,16" fill={C.white} />}
            </Svg>
            <Text style={{ color: active ? C.red : C.white, fontSize: 13, fontWeight: '700', marginLeft: 6 }}>
              {active ? 'Pause' : 'Start'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.ctrlBtn, { backgroundColor: C.surface2, borderColor: C.border }]}
            onPress={() => { setElapsed(0); setActive(false); }}>
            <Svg width={16} height={16} viewBox="0 0 16 16">
              <Path d="M3 8 A5 5 0 1 1 8 13" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <Polygon points="3,4 3,8 7,8" fill={C.muted} />
            </Svg>
            <Text style={{ color: C.muted, fontSize: 13, fontWeight: '600', marginLeft: 6 }}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Timeline */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Line x1="3" y1="2" x2="3" y2="12" stroke={C.muted} strokeWidth="1.4" strokeLinecap="round" />
          <Circle cx="3" cy="4" r="1.8" fill={C.red} />
          <Circle cx="3" cy="8" r="1.8" fill={C.terra} />
          <Circle cx="3" cy="12" r="1.8" fill={C.olive} />
          <Line x1="5.5" y1="4" x2="12" y2="4" stroke={C.muted} strokeWidth="1" strokeLinecap="round" opacity={0.4} />
          <Line x1="5.5" y1="8" x2="11" y2="8" stroke={C.muted} strokeWidth="1" strokeLinecap="round" opacity={0.4} />
          <Line x1="5.5" y1="12" x2="9.5" y2="12" stroke={C.muted} strokeWidth="1" strokeLinecap="round" opacity={0.4} />
        </Svg>
        <Text style={s.sectionLabel}>App Interruptions</Text>
      </View>

      {timeline.map((item, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 10 }}>
          <View style={{ alignItems: 'center', marginRight: 12 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: item.color }} />
            {i < timeline.length - 1 && <View style={{ width: 1.5, flex: 1, backgroundColor: C.border, marginTop: 4 }} />}
          </View>
          <View style={[s.tlCard, { borderColor: `${item.color}20` }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={[s.tlIcon, { backgroundColor: `${item.color}15` }]}>
                  <TimelineIcon type={item.icon} color={item.color} />
                </View>
                <View>
                  <Text style={{ color: C.white, fontWeight: '700', fontSize: 14 }}>{item.app}</Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{item.mins} · {item.ago}</Text>
                </View>
              </View>
              <View style={[s.debtBadge, { backgroundColor: `${item.color}14`, borderColor: `${item.color}28` }]}>
                <Text style={{ color: item.color, fontSize: 12, fontWeight: '800' }}>{item.debtDelta}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}

      {/* Squad */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, marginBottom: 14 }}>
        <Svg width={14} height={14} viewBox="0 0 14 14">
          <Circle cx="5.5" cy="5" r="2.8" fill="none" stroke={C.muted} strokeWidth="1.2" />
          <Circle cx="10.5" cy="4.5" r="2.2" fill="none" stroke={C.muted} strokeWidth="1.2" />
          <Path d="M1 13 C1 9.5 10 9.5 10 13" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <Path d="M10 11 C10 9.5 14 9.5 14 11" stroke={C.muted} strokeWidth="1.2" strokeLinecap="round" fill="none" />
        </Svg>
        <Text style={s.sectionLabel}>Study Squad</Text>
      </View>

      {[
        { name: 'Yash',  status: 'Deep Focus · 18 min', color: C.purple, online: true },
        { name: 'Priya', status: 'On Break',              color: C.terra,  online: true },
        { name: 'Aryan', status: 'Idle',                  color: C.muted,  online: false },
      ].map(m => (
        <View key={m.name} style={s.memberRow}>
          <View style={[s.avatar, { backgroundColor: `${m.color}20` }]}>
            <Text style={{ color: m.color, fontWeight: '800', fontSize: 15 }}>{m.name[0]}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: C.white, fontWeight: '600', fontSize: 14 }}>{m.name}</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginTop: 1 }}>{m.status}</Text>
          </View>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.online ? C.olive : C.muted }} />
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  heroCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: C.border, marginBottom: 16 },
  debtPill: { alignSelf: 'flex-start', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1 },
  meterPin: { width: 16, height: 16, borderRadius: 8, backgroundColor: C.white, borderWidth: 3, borderColor: C.bg },
  timerCard: { backgroundColor: C.surface, borderRadius: 20, padding: 20, borderWidth: 1, borderColor: C.border, marginBottom: 24, alignItems: 'center' },
  modePill: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: C.border },
  timerOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  timerText: { fontSize: 38, fontWeight: '800', letterSpacing: -1 },
  ctrlBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 99, borderWidth: 1 },
  tlCard: { flex: 1, backgroundColor: C.surface, borderRadius: 14, padding: 12, borderWidth: 1 },
  tlIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  debtBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1 },
  memberRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 8 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});

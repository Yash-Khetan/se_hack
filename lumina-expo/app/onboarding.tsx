import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, SafeAreaView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Line, Rect, Polygon, G, Defs, RadialGradient, Stop, LinearGradient as SvgLinear, ClipPath, Ellipse } from 'react-native-svg';
import { C } from '../constants/Colors';

const { width, height } = Dimensions.get('window');
const TOTAL_STEPS = 4;

// ── 3D Mood Orb — sphere-like SVG, no emojis ──────────────────────────────
function MoodOrb() {
  return (
    <View style={{ alignItems: 'center', marginVertical: 20 }}>
      <Svg width={180} height={180} viewBox="0 0 180 180">
        <Defs>
          <RadialGradient id="orbGrad" cx="38%" cy="32%" r="65%">
            <Stop offset="0%" stopColor="#F7E080" stopOpacity="1" />
            <Stop offset="60%" stopColor={C.yellow} stopOpacity="1" />
            <Stop offset="100%" stopColor="#977A1A" stopOpacity="1" />
          </RadialGradient>
          {/* specular highlight */}
          <RadialGradient id="spec" cx="33%" cy="28%" r="30%">
            <Stop offset="0%" stopColor="#FFFBE8" stopOpacity="0.8" />
            <Stop offset="100%" stopColor="#FFFBE8" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        {/* Shadow under sphere */}
        <Ellipse cx="90" cy="172" rx="52" ry="8" fill="#000" opacity="0.35" />
        {/* Sphere body */}
        <Circle cx="90" cy="88" r="76" fill="url(#orbGrad)" />
        {/* Specular */}
        <Circle cx="90" cy="88" r="76" fill="url(#spec)" />
        {/* Eyes — flat inset dots, casting shadow */}
        <Circle cx="70" cy="82" r="7" fill="#2A1F00" />
        <Circle cx="110" cy="82" r="7" fill="#2A1F00" />
        <Circle cx="72" cy="80" r="2.5" fill="#FFFFFF" opacity="0.4" />
        <Circle cx="112" cy="80" r="2.5" fill="#FFFFFF" opacity="0.4" />
        {/* Neutral mouth — straight line with rounded cap */}
        <Path d="M68 108 Q90 110 112 108" stroke="#2A1F00" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      </Svg>
    </View>
  );
}

// ── Mood Gauge Arc ───────────────────────────────────────────────────────────
function MoodGauge() {
  const segments = [
    { color: '#C0392B', startDeg: 180, endDeg: 216 },
    { color: C.terra, startDeg: 218, endDeg: 252 },
    { color: C.yellow, startDeg: 254, endDeg: 286 },
    { color: C.olive, startDeg: 288, endDeg: 322 },
    { color: C.purple, startDeg: 324, endDeg: 360 },
  ];
  const W = width - 48;
  const cx = W / 2, cy = 120, r = 95;

  const polar = (deg: number) => ({
    x: cx + r * Math.cos((deg * Math.PI) / 180),
    y: cy + r * Math.sin((deg * Math.PI) / 180),
  });

  const arcPath = (s: number, e: number, inset = 0) => {
    const inner = r - 24 + inset;
    const ps = polar(s), pe = polar(e);
    const is = { x: cx + inner * Math.cos((s * Math.PI) / 180), y: cy + inner * Math.sin((s * Math.PI) / 180) };
    const ie = { x: cx + inner * Math.cos((e * Math.PI) / 180), y: cy + inner * Math.sin((e * Math.PI) / 180) };
    const large = e - s > 180 ? 1 : 0;
    return `M ${ps.x} ${ps.y} A ${r} ${r} 0 ${large} 1 ${pe.x} ${pe.y} L ${ie.x} ${ie.y} A ${inner} ${inner} 0 ${large} 0 ${is.x} ${is.y} Z`;
  };

  // Needle pointing up (270deg = straight up)
  const needleAngle = 270;
  const nTip = polar(needleAngle - 90); // visual offset to true top
  // Actually compute from center
  const nX = cx + 68 * Math.cos(((270 - 90) * Math.PI) / 180);
  const nY = cy + 68 * Math.sin(((270 - 90) * Math.PI) / 180);

  return (
    <Svg width={W} height={130} style={{ alignSelf: 'center' }}>
      {segments.map((seg, i) => (
        <Path key={i} d={arcPath(seg.startDeg, seg.endDeg)} fill={seg.color} opacity={0.92} />
      ))}
      {/* Needle */}
      <Line x1={cx} y1={cy} x2={cx} y2={cy - 70} stroke="#FFFFFF" strokeWidth={2.5} strokeLinecap="round" />
      <Circle cx={cx} cy={cy} r={6} fill={C.surface} stroke="#FFFFFF" strokeWidth={2} />
    </Svg>
  );
}

// ── Age Picker ───────────────────────────────────────────────────────────────
function AgePicker() {
  const [selected, setSelected] = useState(18);
  const ages = Array.from({ length: 83 }, (_, i) => i + 5);
  const visibleIdx = ages.indexOf(selected);
  const visible = ages.slice(Math.max(0, visibleIdx - 2), visibleIdx + 5);

  return (
    <View style={{ alignItems: 'center', marginVertical: 16, gap: 2 }}>
      {visible.map((age) => {
        const isActive = age === selected;
        return (
          <TouchableOpacity key={age} onPress={() => setSelected(age)} style={{ alignItems: 'center', marginVertical: 2 }}>
            {isActive ? (
              <View style={styles.agePill}>
                <Text style={styles.ageActive}>{age}</Text>
              </View>
            ) : (
              <Text style={[styles.ageMuted, { fontSize: Math.abs(age - selected) === 1 ? 20 : 15, opacity: Math.abs(age - selected) === 1 ? 0.55 : 0.28 }]}>{age}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── 3D Prism Icon (replaces emoji for age screen) ───────────────────────────
function PrismIcon() {
  return (
    <View style={{ alignItems: 'center', marginBottom: 12 }}>
      <Svg width={80} height={80} viewBox="0 0 80 80">
        <Defs>
          <SvgLinear id="face1" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={C.olive} />
            <Stop offset="100%" stopColor="#4F5F3A" />
          </SvgLinear>
          <SvgLinear id="face2" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#3A4A2B" />
            <Stop offset="100%" stopColor="#6A7F52" />
          </SvgLinear>
        </Defs>
        {/* Top face */}
        <Polygon points="40,8 70,26 40,44 10,26" fill={C.olive} opacity={0.95} />
        {/* Left face */}
        <Polygon points="10,26 40,44 40,72 10,54" fill="url(#face2)" />
        {/* Right face */}
        <Polygon points="40,44 70,26 70,54 40,72" fill="url(#face1)" />
      </Svg>
    </View>
  );
}

// ── Meds Screen ──────────────────────────────────────────────────────────────
const ALL_MEDS = ['Abilify', 'Abilify Maintena', 'Abiraterone', 'Acetaminophen', 'Axpelliarmus'];
const CHECKED_MEDS = ['Acetaminophen', 'Axpelliarmus'];
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function CheckCircle({ checked }: { checked: boolean }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 22 22">
      <Circle cx="11" cy="11" r="10" fill={checked ? C.olive : 'none'} stroke={checked ? C.olive : C.border} strokeWidth={1.5} />
      {checked && <Path d="M6 11.5 L9.5 15 L16 8" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />}
    </Svg>
  );
}

function MedsScreen() {
  const [activeLetter, setActiveLetter] = useState('A');
  const [selectedMeds, setSelectedMeds] = useState(['Aspirin', 'Ibuprofen']);
  const [checked, setChecked] = useState<string[]>(CHECKED_MEDS);

  const toggleMed = (med: string) => {
    setChecked(prev => prev.includes(med) ? prev.filter(m => m !== med) : [...prev, med]);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Alpha nav */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 36, marginBottom: 12 }}>
        <View style={{ flexDirection: 'row', gap: 4, paddingHorizontal: 4 }}>
          {ALPHA.map(l => (
            <TouchableOpacity key={l} onPress={() => setActiveLetter(l)}
              style={{
                width: 26, height: 26, borderRadius: 4, alignItems: 'center', justifyContent: 'center',
                backgroundColor: activeLetter === l ? C.olive : 'transparent'
              }}>
              <Text style={{ color: activeLetter === l ? '#fff' : C.muted, fontSize: 11, fontWeight: '600' }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {ALL_MEDS.map((med, i) => (
        <TouchableOpacity key={med} onPress={() => toggleMed(med)}
          style={[styles.medItem, i < ALL_MEDS.length - 1 && { borderBottomWidth: 1, borderColor: C.border }]}>
          <Text style={{ color: C.white, fontSize: 15, flex: 1 }}>{med}</Text>
          <CheckCircle checked={checked.includes(med)} />
        </TouchableOpacity>
      ))}

      {/* Selected tags */}
      <View style={styles.selectedRow}>
        <Text style={{ color: C.muted, fontSize: 12, marginRight: 6 }}>Selected:</Text>
        {selectedMeds.map(m => (
          <TouchableOpacity key={m} onPress={() => setSelectedMeds(p => p.filter(x => x !== m))}
            style={styles.selectedTag}>
            <Text style={{ color: C.white, fontSize: 11 }}>{m}</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Happiness Tag Cloud ──────────────────────────────────────────────────────
const ALL_TAGS = ['Mastery', 'Connection', 'Empathy', 'Challenge', 'Validation', 'Impact', 'Playfulness', 'Creation', 'Growth', 'Improvement', 'Freedom', 'Curiosity', 'Purpose', 'Rest', 'Flow'];
const TAG_STYLE: Record<string, { bg: string; text: string }> = {
  Creation: { bg: C.olive, text: '#fff' },
  Growth:   { bg: C.terra, text: '#fff' },
  Improvement: { bg: C.purple, text: '#fff' },
};

function TagCloud() {
  const [active, setActive] = useState<string[]>(['Creation', 'Growth', 'Improvement']);
  const [selected, setSelected] = useState(['Pets', 'Jokes']);

  const toggle = (tag: string) => setActive(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag]);

  return (
    <View style={{ flex: 1 }}>
      {/* 3D Cube icon */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <Svg width={64} height={64} viewBox="0 0 64 64">
          <Defs>
            <SvgLinear id="ct" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor={C.terra} />
              <Stop offset="100%" stopColor="#7A3D1A" />
            </SvgLinear>
          </Defs>
          <Polygon points="32,6 56,20 32,34 8,20" fill={C.terra} opacity={0.9} />
          <Polygon points="8,20 32,34 32,58 8,44" fill="#7A3D1A" />
          <Polygon points="32,34 56,20 56,44 32,58" fill="url(#ct)" />
        </Svg>
      </View>

      <View style={styles.tagWrap}>
        {ALL_TAGS.map(tag => {
          const isActive = active.includes(tag);
          const styleOverride = TAG_STYLE[tag];
          return (
            <TouchableOpacity key={tag} onPress={() => toggle(tag)}
              style={[styles.tag, isActive && (styleOverride ? { backgroundColor: styleOverride.bg, borderColor: 'transparent' } : { backgroundColor: C.olive, borderColor: 'transparent' })]}>
              <Text style={{ color: isActive ? (styleOverride?.text || '#fff') : C.muted, fontSize: 13, fontWeight: '500' }}>{tag}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Selected row */}
      <View style={styles.selectedRow}>
        <Text style={{ color: C.muted, fontSize: 12, marginRight: 6 }}>Selected:</Text>
        {selected.map(s => (
          <TouchableOpacity key={s} onPress={() => setSelected(p => p.filter(x => x !== s))}
            style={styles.selectedTag}>
            <Text style={{ color: C.white, fontSize: 11 }}>{s}</Text>
            <Text style={{ color: C.muted, fontSize: 11, marginLeft: 4 }}>✕</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ── Main Onboarding Component ────────────────────────────────────────────────
const SCREENS = [
  { id: 0, title: "How would you describe your mood?", sub: "I Feel Neutral." },
  { id: 1, title: "What's your age?", sub: "Scroll to select." },
  { id: 2, title: "Please specify your medications!", sub: null },
  { id: 3, title: "What are the things that make you happy?", sub: null },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  const handleContinue = () => {
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
    else router.replace('/(tabs)');
  };

  const screen = SCREENS[step];
  const progress = (step + 1) / TOTAL_STEPS;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backBtn} onPress={() => step > 0 && setStep(step - 1)}>
          <Svg width={18} height={18} viewBox="0 0 18 18">
            <Path d="M11 4 L6 9 L11 14" stroke={C.white} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </Svg>
        </TouchableOpacity>

        {/* Progress bar */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
        </View>

        <TouchableOpacity onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>{screen.title}</Text>
        {screen.sub && <Text style={styles.subHeading}>{screen.sub}</Text>}

        <View style={{ marginTop: 8 }}>
          {step === 0 && (
            <View style={{ alignItems: 'center' }}>
              <MoodOrb />
              <MoodGauge />
            </View>
          )}
          {step === 1 && (
            <View style={{ alignItems: 'center' }}>
              <PrismIcon />
              <AgePicker />
            </View>
          )}
          {step === 2 && <MedsScreen />}
          {step === 3 && <TagCloud />}
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
          <Text style={styles.continueBtnText}>Continue  →</Text>
        </TouchableOpacity>
        <View style={styles.homeIndicator} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  topNav: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8, gap: 12
  },
  backBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center'
  },
  progressBarBg: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(160,152,143,0.2)', overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: C.olive,
  },
  skipText: { color: C.muted, fontSize: 13, fontWeight: '500' },
  contentWrap: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  heading: {
    color: C.white, fontSize: 26, fontWeight: '700',
    letterSpacing: -0.5, lineHeight: 34, marginBottom: 8
  },
  subHeading: {
    color: C.muted, fontSize: 14, textAlign: 'center', marginBottom: 8
  },
  // Age picker
  agePill: {
    backgroundColor: C.olive, borderRadius: 48,
    paddingHorizontal: 48, paddingVertical: 14,
    minWidth: 140, alignItems: 'center',
    shadowColor: C.olive, shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }
  },
  ageActive: { color: '#fff', fontSize: 52, fontWeight: '800', fontVariant: ['tabular-nums'] },
  ageMuted: { color: C.muted, fontWeight: '500', fontVariant: ['tabular-nums'] },
  // Meds
  medItem: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 4,
  },
  // Tags
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  tag: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 24, borderWidth: 1, borderColor: C.border,
    backgroundColor: C.surface,
  },
  // Selected row
  selectedRow: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    marginTop: 16, gap: 6
  },
  selectedTag: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.surface2, borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    borderWidth: 1, borderColor: C.border,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: 24, paddingTop: 12, paddingBottom: 8,
    backgroundColor: C.bg,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  continueBtn: {
    backgroundColor: C.button, borderRadius: 99,
    paddingVertical: 16, alignItems: 'center',
  },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  homeIndicator: {
    width: 120, height: 5, borderRadius: 3,
    backgroundColor: C.muted, alignSelf: 'center',
    marginTop: 10, opacity: 0.5
  },
});

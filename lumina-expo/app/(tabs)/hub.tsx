import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import Svg, { Circle, Path, Polygon, Line, Defs, LinearGradient as SvgLinear, Stop } from 'react-native-svg';
import { useState, useRef, useEffect } from 'react';

const C = {
  bg: '#16100B', surface: '#221A14', surface2: '#2C2018',
  white: '#FFFFFF', muted: '#A0988F',
  olive: '#8FA071', terra: '#D37B40', purple: '#8D7AE6', yellow: '#EBC352',
  button: '#6A4331', border: 'rgba(160,152,143,0.15)', red: '#C0392B',
};

// rect as Path helper
const RP = (x: number, y: number, w: number, h: number, rx = 0) => {
  if (rx === 0) return `M${x} ${y} L${x+w} ${y} L${x+w} ${y+h} L${x} ${y+h} Z`;
  return `M${x+rx} ${y} L${x+w-rx} ${y} Q${x+w} ${y} ${x+w} ${y+rx} L${x+w} ${y+h-rx} Q${x+w} ${y+h} ${x+w-rx} ${y+h} L${x+rx} ${y+h} Q${x} ${y+h} ${x} ${y+h-rx} L${x} ${y+rx} Q${x} ${y} ${x+rx} ${y} Z`;
};

const memberColors: Record<string, string> = {
  Renee: C.olive, Yash: C.purple, Priya: C.terra, Aryan: C.yellow,
};

// Blinking online dot
function OnlineDot({ online }: { online: boolean }) {
  const anim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!online) return;
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(anim, { toValue: 0.25, duration: 900, useNativeDriver: true }),
      Animated.timing(anim, { toValue: 1,    duration: 900, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [online]);
  return (
    <Animated.View style={{
      position: 'absolute', bottom: 0, right: 0,
      width: 10, height: 10, borderRadius: 5,
      backgroundColor: online ? C.olive : C.muted,
      borderWidth: 2, borderColor: C.bg,
      opacity: online ? anim : 1,
    }} />
  );
}

function Avatar({ name, color }: { name: string; color: string }) {
  return (
    <View style={{ position: 'relative' }}>
      <View style={[s.avatar, { backgroundColor: `${color}20` }]}>
        <Text style={{ color, fontWeight: '800', fontSize: 13 }}>{name[0]}</Text>
      </View>
      <OnlineDot online />
    </View>
  );
}

// Chat bubble cluster hero — all Path, no Rect
function ChatHero() {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 18 }}>
      <Svg width={128} height={86} viewBox="0 0 128 86">
        <Defs>
          <SvgLinear id="b1" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={C.surface2} />
            <Stop offset="100%" stopColor={C.bg} />
          </SvgLinear>
        </Defs>
        {/* Back bubble */}
        <Path d={RP(32, 6, 82, 46, 14)} fill="url(#b1)" stroke={C.border} strokeWidth="1" />
        <Path d={RP(82, 50, 14, 10, 3)} fill={C.bg} />
        {/* Front bubble */}
        <Path d={RP(4, 26, 76, 44, 14)} fill={C.surface} stroke={`${C.olive}32`} strokeWidth="1.5" />
        <Path d={RP(8, 68, 14, 10, 3)} fill={C.surface} />
        {/* Content lines */}
        <Path d={RP(16, 37, 52, 4, 2)} fill={C.olive} opacity={0.5} />
        <Path d={RP(16, 46, 38, 4, 2)} fill={C.muted} opacity={0.3} />
        <Path d={RP(16, 55, 26, 4, 2)} fill={C.muted} opacity={0.18} />
        {/* Back lines */}
        <Path d={RP(42, 18, 54, 3, 1.5)} fill={C.muted} opacity={0.18} />
        <Path d={RP(42, 25, 40, 3, 1.5)} fill={C.muted} opacity={0.1} />
      </Svg>
      <Text style={{ color: C.white, fontSize: 18, fontWeight: '700', marginTop: 6, letterSpacing: -0.3 }}>Group Hub</Text>
      <Text style={{ color: C.muted, fontSize: 12, marginTop: 3 }}>4 members active</Text>
    </View>
  );
}

// Pin/star accent icon
function PinStar({ color }: { color: string }) {
  return (
    <Svg width={15} height={15} viewBox="0 0 14 14">
      <Polygon points="7,1 8.8,5.4 13.5,5.4 9.8,8.6 11.1,13 7,10.2 2.9,13 4.2,8.6 0.5,5.4 5.2,5.4" fill={color} opacity={0.9} />
    </Svg>
  );
}

const initialMessages = [
  { id: '1', text: 'Did Prof say the ER diagram needs to be in 3NF?', sender: 'Yash',  time: '10:23', own: false },
  { id: '2', text: 'Yes, confirmed. Third normal form specifically.',    sender: 'Priya', time: '10:25', own: false },
  { id: '3', text: "Updating outline now. Check the FD table?",          sender: 'Renee', time: '10:28', own: true  },
  { id: '4', text: 'On it. Also — submission tonight 11:59 PM.',         sender: 'Aryan', time: '10:30', own: false },
  { id: '5', text: 'Wait WHAT. Pushing everything now.',                 sender: 'Yash',  time: '10:31', own: false },
];

const pins = [
  { id: '1', text: 'ER Diagram must be in 3NF.',                          pinner: 'Priya' },
  { id: '2', text: 'Submit at: bit.ly/dbms-proj · 11:59 PM tonight',     pinner: 'Aryan' },
];

const tasks = [
  { id: '1', label: 'Normalize ER to 3NF',       status: 'doing',   assignee: 'Renee' },
  { id: '2', label: 'Write FD table',              status: 'doing',   assignee: 'Aryan' },
  { id: '3', label: "Review Yash's section",       status: 'backlog', assignee: 'Priya' },
  { id: '4', label: 'Upload to submission portal', status: 'backlog', assignee: 'Yash'  },
];

const statusCfg: Record<string, { color: string; label: string }> = {
  doing:   { color: C.terra, label: 'In Progress' },
  backlog: { color: C.muted, label: 'Backlog'     },
  done:    { color: C.olive, label: 'Done'        },
};

export default function HubScreen() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput]       = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'pins' | 'tasks'>('chat');
  const scrollRef = useRef<ScrollView>(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages(p => [...p, {
      id: Date.now().toString(), text: input.trim(), sender: 'Renee',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), own: true,
    }]);
    setInput('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={92}>

      {/* Online avatars */}
      <View style={s.onlineRow}>
        {Object.entries(memberColors).map(([name, color]) => (
          <View key={name} style={{ alignItems: 'center', marginRight: 18 }}>
            <Avatar name={name} color={color} />
            <Text style={{ color: C.muted, fontSize: 9, marginTop: 5 }}>{name}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <View style={s.tabRow}>
        {(['chat', 'pins', 'tasks'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}
            style={[s.tabBtn, activeTab === tab && s.tabActive]}>
            <Text style={{ color: activeTab === tab ? C.olive : C.muted, fontSize: 12, fontWeight: '700', textTransform: 'capitalize' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat */}
      {activeTab === 'chat' && (
        <>
          <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
            <ChatHero />
            {messages.map(msg => {
              const col = memberColors[msg.sender] || C.muted;
              return (
                <View key={msg.id} style={[s.msgRow, msg.own && { justifyContent: 'flex-end' }]}>
                  {!msg.own && (
                    <View style={[s.avatar, { backgroundColor: `${col}18`, marginRight: 8 }]}>
                      <Text style={{ color: col, fontWeight: '800', fontSize: 12 }}>{msg.sender[0]}</Text>
                    </View>
                  )}
                  <View style={{ maxWidth: '74%' }}>
                    {!msg.own && <Text style={{ color: col, fontSize: 10, fontWeight: '700', marginBottom: 3, marginLeft: 2 }}>{msg.sender}</Text>}
                    <View style={[s.bubble, msg.own ? s.bubbleOwn : s.bubbleOther]}>
                      <Text style={{ color: C.white, fontSize: 14, lineHeight: 20 }}>{msg.text}</Text>
                      <Text style={{ color: msg.own ? 'rgba(255,255,255,0.4)' : C.muted, fontSize: 10, alignSelf: 'flex-end', marginTop: 4 }}>{msg.time}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
          <View style={s.inputRow}>
            <TextInput style={s.input} placeholder="Message the group..." placeholderTextColor={C.muted}
              value={input} onChangeText={setInput} onSubmitEditing={send} returnKeyType="send" />
            <TouchableOpacity style={s.sendBtn} onPress={send}>
              <Svg width={17} height={17} viewBox="0 0 17 17">
                <Path d="M1.5 8.5 L15.5 2.5 L10.5 14.5 L8 9 Z" fill={C.white} />
                <Line x1="1.5" y1="8.5" x2="8" y2="9" stroke={C.white} strokeWidth="1.2" />
              </Svg>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Pins */}
      {activeTab === 'pins' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={[s.sectionLabel, { marginBottom: 14 }]}>Pinned Items</Text>
          {pins.map(pin => (
            <View key={pin.id} style={s.pinCard}>
              <PinStar color={C.terra} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: C.white, fontSize: 14, lineHeight: 21 }}>{pin.text}</Text>
                <Text style={{ color: C.muted, fontSize: 11, marginTop: 5 }}>Pinned by {pin.pinner}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* Tasks */}
      {activeTab === 'tasks' && (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
          <Text style={[s.sectionLabel, { marginBottom: 14 }]}>Group Tasks</Text>
          {tasks.map(task => {
            const cfg = statusCfg[task.status];
            return (
              <View key={task.id} style={s.taskCard}>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cfg.color, marginRight: 12, marginTop: 3 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ color: C.white, fontSize: 14, fontWeight: '600' }}>{task.label}</Text>
                  <Text style={{ color: C.muted, fontSize: 11, marginTop: 3 }}>{task.assignee}</Text>
                </View>
                <View style={[s.statusTag, { backgroundColor: `${cfg.color}14`, borderColor: `${cfg.color}28` }]}>
                  <Text style={{ color: cfg.color, fontSize: 10, fontWeight: '700' }}>{cfg.label}</Text>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  onlineRow: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, borderBottomWidth: 1, borderColor: C.border },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: C.border },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderColor: 'transparent' },
  tabActive: { borderColor: C.olive },
  sectionLabel: { color: C.muted, fontSize: 11, fontWeight: '700', letterSpacing: 0.7, textTransform: 'uppercase' },
  msgRow: { flexDirection: 'row', marginBottom: 14, alignItems: 'flex-end' },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleOwn:   { backgroundColor: C.button, borderBottomRightRadius: 5 },
  bubbleOther: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderBottomLeftRadius: 5 },
  inputRow: { flexDirection: 'row', padding: 12, gap: 10, borderTopWidth: 1, borderColor: C.border, alignItems: 'center', backgroundColor: C.bg },
  input: { flex: 1, backgroundColor: C.surface, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 11, color: C.white, fontSize: 14, borderWidth: 1, borderColor: C.border },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.button, alignItems: 'center', justifyContent: 'center' },
  pinCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: `${C.terra}22`, marginBottom: 10 },
  taskCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: C.surface, borderRadius: 14, padding: 14, borderWidth: 1, borderColor: C.border, marginBottom: 10 },
  statusTag: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, borderWidth: 1, alignSelf: 'flex-start' },
});

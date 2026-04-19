import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';
import { useUser } from '@/context/UserContext';
import { ArrowLeft, Send, Sparkles, Coffee, Train, ShoppingBag, Utensils, Moon, Target, TrendingDown } from 'lucide-react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
  Layout,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
  withSequence,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

// Types
interface Expense {
  id: string;
  amount: number;
  category: string;
  note: string;
  date: string;
  icon: any;
  color: string;
}

const CATEGORY_MAP: Record<string, { icon: any; color: string }> = {
  food: { icon: Utensils, color: '#10B981' },
  coffee: { icon: Coffee, color: '#D97706' },
  travel: { icon: Train, color: '#3B82F6' },
  shopping: { icon: ShoppingBag, color: '#8B5CF6' },
  general: { icon: Sparkles, color: '#94A3B8' },
};

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', amount: 150, category: 'food', note: 'Late night cravings', date: 'Today, 2:30 AM', icon: Utensils, color: '#10B981' },
  { id: '2', amount: 40, category: 'travel', note: 'Metro to College', date: 'Yesterday', icon: Train, color: '#3B82F6' },
  { id: '3', amount: 220, category: 'shopping', note: 'Stationery', date: 'Mon, 14th Apr', icon: ShoppingBag, color: '#8B5CF6' },
];

export default function ExpensesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { expenses, addExpense, totalSpend, budget } = useUser();

  const [input, setInput] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  // Reanimated values
  const inputScale = useSharedValue(1);
  const toastOpacity = useSharedValue(0);
  const toastTranslateY = useSharedValue(20);

  // Parse simple NLP (e.g., "spent 150 on food")
  const parseExpense = (text: string) => {
    const amountMatch = text.match(/\d+/);
    const amount = amountMatch ? parseInt(amountMatch[0], 10) : 0;

    let category = 'general';
    const lower = text.toLowerCase();
    if (lower.includes('food') || lower.includes('ate') || lower.includes('dinner')) category = 'food';
    else if (lower.includes('coffee') || lower.includes('chai')) category = 'coffee';
    else if (lower.includes('travel') || lower.includes('uber') || lower.includes('metro')) category = 'travel';
    else if (lower.includes('shopping') || lower.includes('bought')) category = 'shopping';

    return { amount, category };
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    toastOpacity.value = withTiming(1, { duration: 300 });
    toastTranslateY.value = withSpring(0);

    setTimeout(() => {
      toastOpacity.value = withTiming(0, { duration: 300 });
      toastTranslateY.value = withTiming(20, { duration: 300 });
    }, 3000);
  };

  const handleLogExpense = () => {
    if (!input.trim()) return;

    // Button pop animation
    inputScale.value = withSequence(
      withSpring(0.95),
      withSpring(1)
    );

    const { amount, category } = parseExpense(input);
    if (amount > 0) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        amount,
        category,
        note: input.replace(/\d+/g, '').replace('spent', '').replace('on', '').trim() || 'Quick log',
        date: 'Just now',
        icon: CATEGORY_MAP[category].icon,
        color: CATEGORY_MAP[category].color,
      };

      addExpense(newExpense);
      setInput('');

      // Emotionally intelligent feedback
      const msgs = [
        "Noted. Small steps matter.",
        "Tracked! Awareness is half the battle.",
        "Got it. Every rupee tracked is a habit formed."
      ];
      showToast(msgs[Math.floor(Math.random() * msgs.length)]);
    } else {
      showToast("Didn't catch an amount. E.g., 'spent 150 on coffee'");
    }
  };

  const animatedToastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastTranslateY.value }],
  }));

  const animatedInputStyle = useAnimatedStyle(() => ({
    transform: [{ scale: inputScale.value }],
  }));

  const progress = Math.min((totalSpend / budget) * 100, 100);

  return (
    <KeyboardAvoidingView
      style={[{ flex: 1, backgroundColor: colors.backgroundGradient[0] }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={20}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview Dashboard */}
        <Animated.View entering={FadeInDown.delay(100).duration(500)} style={[styles.overviewCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
          <Text style={[styles.cardSub, { color: colors.textMuted }]}>Weekly Spend</Text>
          <Text style={[styles.totalSpend, { color: colors.text }]}>₹{totalSpend}</Text>

          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>₹{budget - totalSpend} remaining</Text>
            <Text style={[styles.budgetLabel, { color: colors.textMuted }]}>₹{budget} budget</Text>
          </View>

          <View style={[styles.progressBarBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
            <Animated.View
              style={[
                styles.progressBarFill,
                { width: `${progress}%`, backgroundColor: progress > 85 ? colors.warning : colors.accent }
              ]}
              layout={Layout.springify()}
            />
          </View>
        </Animated.View>

        {/* Weekly Student Wrap */}
        <Animated.View entering={FadeInDown.delay(200).duration(500)}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Wrap</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {[
              { Icon: Moon, text: 'You spend more after 9 PM. Late night snacks?', color: colors.accentSecondary },
              { Icon: Target, text: 'Stayed within budget 4 days this week.', color: colors.success },
              { Icon: TrendingDown, text: 'Travel spending is down 15% vs last week.', color: colors.accent },
            ].map((insight, idx) => (
              <View key={idx} style={[styles.insightCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
                <insight.Icon size={24} color={insight.color} style={{ marginBottom: 12 }} />
                <Text style={[styles.insightText, { color: colors.text }]}>{insight.text}</Text>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Timeline */}
        <Animated.View entering={FadeInDown.delay(300).duration(500)} style={styles.timelineContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginLeft: 20 }]}>Recent Logs</Text>

          <View style={styles.timeline}>
            {expenses.map((expense, index) => {
              const catData = CATEGORY_MAP[expense.category] || CATEGORY_MAP['general'];
              const Icon = catData.icon;
              const iconColor = expense.color || catData.color;
              return (
                <Animated.View
                  key={expense.id}
                  entering={FadeInUp.delay(400 + index * 100)}
                  layout={Layout.springify()}
                  style={styles.timelineItem}
                >
                  <View style={styles.timelineTrack}>
                    <View style={[styles.timelineDot, { backgroundColor: iconColor + '20', borderColor: iconColor }]} />
                    {index !== expenses.length - 1 && <View style={[styles.timelineLine, { backgroundColor: colors.borderStrong }]} />}
                  </View>

                  <View style={[styles.expenseCard, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
                    <View style={[styles.expenseIconBox, { backgroundColor: iconColor + '15' }]}>
                      <Icon size={20} color={iconColor} />
                    </View>
                    <View style={styles.expenseContext}>
                      <Text style={[styles.expenseCategory, { color: colors.text }]}>{expense.note}</Text>
                      <Text style={[styles.expenseDate, { color: colors.textMuted }]}>{expense.date}</Text>
                    </View>
                    <Text style={[styles.expenseAmount, { color: colors.text }]}>₹{expense.amount}</Text>
                  </View>
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Emotionally Intelligent Toast */}
      <Animated.View style={[styles.toastContainer, animatedToastStyle, { backgroundColor: colors.cardSolid, borderColor: colors.border }]}>
        <Sparkles size={16} color={colors.accent} />
        <Text style={[styles.toastText, { color: colors.text }]}>{toastMsg}</Text>
      </Animated.View>

      {/* NLP Input Bar */}
      <Animated.View style={[styles.inputWrapper, { backgroundColor: colors.cardSolid, borderTopColor: colors.border }, animatedInputStyle]}>
        <TextInput
          style={[styles.input, { color: colors.text, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)', borderColor: colors.inputBorder }]}
          placeholder="e.g., spent 150 on food..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleLogExpense}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: colors.accent }]}
          onPress={handleLogExpense}
        >
          <Send size={18} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingTop: 24,
  },
  // Overview Card
  overviewCard: {
    marginHorizontal: 20,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 32,
  },
  cardSub: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  totalSpend: {
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 24,
    letterSpacing: -1,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  // Insights Wrap
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
    marginLeft: 20,
  },
  insightCard: {
    width: 220,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  // Timeline
  timelineContainer: {
    marginTop: 32,
  },
  timeline: {
    paddingHorizontal: 20,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineTrack: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 3,
    marginTop: 24,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    position: 'absolute',
    top: 38,
    bottom: -24,
    zIndex: 1,
  },
  expenseCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  expenseIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  expenseContext: {
    flex: 1,
  },
  expenseCategory: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  expenseDate: {
    fontSize: 12,
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 15,
    marginRight: 12,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 80,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 8,
  },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, Modal, TouchableOpacity,
  Animated, Dimensions, TextInput, ScrollView, Switch,
  KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import {
  X, Settings, CreditCard, LogOut, ChevronRight,
  User, Calendar, Moon, Sun, Bell, Shield, ArrowLeft, Check, Edit2, CheckSquare
} from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);
import { useUser, Profile, AppSettings } from '@/context/UserContext';
import { useStress } from '@/context/StressContext';

interface Props {
  visible: boolean;
  onClose: () => void;
}

type DrawerView = 'main' | 'settings' | 'edit-profile';

export default function ProfileDrawer({ visible, onClose }: Props) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const { profile, setProfile, settings, setSettings } = useUser();
  const { disconnectGoogle } = useStress();
  const [slideAnim] = useState(new Animated.Value(width));
  const [view, setView] = useState<DrawerView>('main');
  const [editingProfile, setEditingProfile] = useState<Profile>(profile);

  const handleSignOut = () => {
    onClose();
    disconnectGoogle();
  };

  useEffect(() => {
    if (visible) {
      setView('main');
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 12,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 220,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    onClose();
  };

  const handleSaveProfile = () => {
    if (!editingProfile.name.trim()) {
      Alert.alert('Validation', 'Name cannot be empty.');
      return;
    }
    setProfile(editingProfile);
    setView('settings');
  };

  const handleSettingToggle = (key: keyof AppSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
  };

  const getInitials = (name: string) =>
    name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const formatDOB = (dob: string) => {
    if (!dob) return 'Not set';
    try {
      return new Date(dob).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dob;
    }
  };

  // ── Main View ──
  const renderMain = () => (
    <>
      <View style={styles.drawerHeader}>
        <Text style={styles.drawerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <X size={22} color={Colors.theme.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>{getInitials(profile.name)}</Text>
        </View>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
        <View style={styles.infoPills}>
          <View style={styles.pill}><Text style={styles.pillText}>{profile.course}</Text></View>
          <View style={styles.pill}><Text style={styles.pillText}>{profile.year}</Text></View>
        </View>
      </View>

      <View style={styles.menuList}>
        <TouchableOpacity style={styles.menuItem} onPress={() => { setEditingProfile({ ...profile }); setView('settings'); }}>
          <View style={styles.menuIconBox}>
            <Settings size={18} color={Colors.theme.accent} />
          </View>
          <Text style={styles.menuLabel}>Settings</Text>
          <ChevronRight size={16} color={Colors.theme.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            handleClose();
            router.push('/expenses');
          }}
        >
          <View style={styles.menuIconBox}>
            <CreditCard size={18} color={Colors.theme.accent} />
          </View>
          <Text style={styles.menuLabel}>Expense Summary</Text>
          <ChevronRight size={16} color={Colors.theme.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => {
            handleClose();
            router.push('/kanban');
          }}
        >
          <View style={styles.menuIconBox}>
            <CheckSquare size={18} color={Colors.theme.accent} />
          </View>
          <Text style={styles.menuLabel}>Personal Kanban</Text>
          <ChevronRight size={16} color={Colors.theme.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuIconBox}>
            <Shield size={18} color={Colors.theme.accent} />
          </View>
          <Text style={styles.menuLabel}>Privacy & Security</Text>
          <ChevronRight size={16} color={Colors.theme.textMuted} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <LogOut size={18} color={Colors.theme.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </>
  );

  // ── Settings View ──
  const renderSettings = () => (
    <>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={() => setView('main')} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft size={20} color={Colors.theme.text} />
        </TouchableOpacity>
        <Text style={styles.drawerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleClose} style={styles.closeBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <X size={22} color={Colors.theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {/* Profile Edit Card */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <TouchableOpacity style={styles.profileEditCard} onPress={() => setView('edit-profile')}>
          <View style={styles.avatarSmall}>
            <Text style={styles.avatarTextSmall}>{getInitials(profile.name)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileEditName}>{profile.name}</Text>
            <Text style={styles.profileEditSub}>{profile.email}</Text>
            <Text style={styles.profileEditSub}>DOB: {formatDOB(profile.dateOfBirth)}</Text>
          </View>
          <View style={styles.editChip}>
            <Edit2 size={12} color={Colors.theme.accent} />
            <Text style={styles.editChipText}>Edit</Text>
          </View>
        </TouchableOpacity>

        {/* Appearance */}
        <Text style={styles.sectionLabel}>APPEARANCE</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              {isDark
                ? <Moon size={16} color={Colors.theme.accent} />
                : <Sun size={16} color={Colors.theme.warning} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Dark Mode</Text>
              <Text style={styles.settingDesc}>{isDark ? 'Currently Dark' : 'Currently Light'}</Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                toggleTheme();
                handleSettingToggle('darkMode');
              }}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(59,130,246,0.5)' }}
              thumbColor={isDark ? Colors.theme.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* Notifications */}
        <Text style={styles.sectionLabel}>NOTIFICATIONS</Text>
        <View style={styles.settingsCard}>
          <View style={styles.settingRow}>
            <View style={styles.settingIconBox}>
              <Bell size={16} color={Colors.theme.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDesc}>Alerts for classes, reminders</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => handleSettingToggle('notifications')}
              trackColor={{ false: 'rgba(255,255,255,0.15)', true: 'rgba(59,130,246,0.5)' }}
              thumbColor={settings.notifications ? Colors.theme.accent : '#f4f3f4'}
            />
          </View>
        </View>

        {/* App Info */}
        <Text style={styles.sectionLabel}>ABOUT</Text>
        <View style={styles.settingsCard}>
          {[
            { label: 'Version', value: '1.2.0' },
            { label: 'Build', value: '2026.04.19' },
            { label: 'College', value: profile.college },
          ].map((row, i, arr) => (
            <View key={row.label} style={[styles.infoRow, i < arr.length - 1 && styles.infoRowBorder]}>
              <Text style={styles.infoLabel}>{row.label}</Text>
              <Text style={styles.infoValue}>{row.value}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleSignOut}>
        <LogOut size={18} color={Colors.theme.danger} />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </>
  );

  // ── Edit Profile View ──
  const renderEditProfile = () => (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={() => setView('settings')} style={styles.backBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <ArrowLeft size={20} color={Colors.theme.text} />
        </TouchableOpacity>
        <Text style={styles.drawerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Check size={20} color={Colors.theme.success} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {[
          { field: 'name' as keyof Profile, label: 'Full Name', icon: User, placeholder: 'e.g. Miti Sharma' },
          { field: 'email' as keyof Profile, label: 'Email', icon: null, placeholder: 'e.g. miti@student.edu', keyboardType: 'email-address' as any },
          { field: 'dateOfBirth' as keyof Profile, label: 'Date of Birth', icon: Calendar, placeholder: 'YYYY-MM-DD' },
          { field: 'course' as keyof Profile, label: 'Course', icon: null, placeholder: 'e.g. B.Tech CSE' },
          { field: 'college' as keyof Profile, label: 'College / Institute', icon: null, placeholder: 'e.g. MIT' },
          { field: 'year' as keyof Profile, label: 'Year of Study', icon: null, placeholder: 'e.g. 3rd Year' },
        ].map((item) => (
          <View key={item.field} style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>{item.label}</Text>
            <TextInput
              style={styles.fieldInput}
              value={editingProfile[item.field]}
              onChangeText={(val) => setEditingProfile(prev => ({ ...prev, [item.field]: val }))}
              placeholder={item.placeholder}
              placeholderTextColor={Colors.theme.textMuted}
              keyboardType={item.keyboardType || 'default'}
              autoCapitalize={item.field === 'email' ? 'none' : 'words'}
            />
          </View>
        ))}

        <TouchableOpacity style={styles.saveProfileBtn} onPress={handleSaveProfile}>
          <Check size={18} color="#fff" />
          <Text style={styles.saveProfileText}>Save Changes</Text>
        </TouchableOpacity>
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />

        <AnimatedBlurView
          intensity={90}
          tint="dark"
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          {view === 'main' && (
            <View style={styles.panelContainer}>
              {renderMain()}
            </View>
          )}
          {view === 'settings' && (
            <View style={styles.panelContainer}>
              {renderSettings()}
            </View>
          )}
          {view === 'edit-profile' && (
            <View style={styles.panelContainer}>
              {renderEditProfile()}
            </View>
          )}
        </AnimatedBlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, flexDirection: 'row' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  panelContainer: { flex: 1, display: 'flex', flexDirection: 'column' },
  drawer: {
    width: width * 0.82,
    backgroundColor: 'rgba(9, 14, 28, 0.97)',
    borderLeftWidth: 1,
    borderLeftColor: Colors.theme.border,
    paddingTop: 60,
    paddingHorizontal: 22,
    paddingBottom: 30,
  },
  // Header
  drawerHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  drawerTitle: { color: Colors.theme.text, fontSize: 22, fontWeight: '700', flex: 1, textAlign: 'center' },
  closeBtn: { padding: 4 },
  backBtn: { padding: 4 },
  saveBtn: { padding: 4 },
  // Profile section
  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarLarge: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(59,130,246,0.15)',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 2, borderColor: Colors.theme.accent,
  },
  avatarTextLarge: { color: Colors.theme.accent, fontSize: 32, fontWeight: '800' },
  name: { color: Colors.theme.text, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  email: { color: Colors.theme.textMuted, fontSize: 13, marginBottom: 12 },
  infoPills: { flexDirection: 'row', gap: 8 },
  pill: { backgroundColor: 'rgba(59,130,246,0.1)', borderWidth: 1, borderColor: 'rgba(59,130,246,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { color: Colors.theme.accent, fontSize: 11, fontWeight: '600' },
  // Menu items
  menuList: { flex: 1 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  menuIconBox: { width: 38, height: 38, borderRadius: 11, backgroundColor: Colors.theme.cardSolid, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuLabel: { color: Colors.theme.text, fontSize: 15, fontWeight: '500' },
  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 14, marginTop: 16, borderWidth: 1, borderColor: 'rgba(239,68,68,0.15)' },
  logoutText: { color: Colors.theme.danger, fontSize: 15, fontWeight: '700', marginLeft: 10 },
  // Settings
  sectionLabel: { color: Colors.theme.textMuted, fontSize: 10, fontWeight: '700', letterSpacing: 1.5, marginBottom: 8, marginTop: 18 },
  settingsCard: { backgroundColor: Colors.theme.cardSolid, borderRadius: 16, borderWidth: 1, borderColor: Colors.theme.border, overflow: 'hidden', marginBottom: 4 },
  settingRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  settingIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(59,130,246,0.1)', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { color: Colors.theme.text, fontSize: 14, fontWeight: '600' },
  settingDesc: { color: Colors.theme.textMuted, fontSize: 11, marginTop: 2 },
  // Profile edit card
  profileEditCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.theme.cardSolid, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.theme.border, gap: 12, marginBottom: 4 },
  avatarSmall: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(59,130,246,0.15)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.theme.accent },
  avatarTextSmall: { color: Colors.theme.accent, fontSize: 16, fontWeight: '800' },
  profileEditName: { color: Colors.theme.text, fontSize: 14, fontWeight: '700' },
  profileEditSub: { color: Colors.theme.textMuted, fontSize: 11, marginTop: 2 },
  editChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(59,130,246,0.1)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, gap: 4 },
  editChipText: { color: Colors.theme.accent, fontSize: 11, fontWeight: '700' },
  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 14 },
  infoRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  infoLabel: { color: Colors.theme.textMuted, fontSize: 13 },
  infoValue: { color: Colors.theme.text, fontSize: 13, fontWeight: '600' },
  // Edit profile form
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { color: Colors.theme.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 7 },
  fieldInput: {
    backgroundColor: Colors.theme.cardSolid, borderWidth: 1, borderColor: Colors.theme.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: Colors.theme.text, fontSize: 14,
  },
  saveProfileBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.theme.accent, borderRadius: 14, paddingVertical: 14, marginTop: 8, gap: 8 },
  saveProfileText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

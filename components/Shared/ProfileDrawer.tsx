import React from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { X, Settings, Award, CreditCard, LogOut } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { BlurView } from 'expo-blur';

const { width } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

interface Props {
  visible: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'badges', icon: Award, label: 'Achievements' },
  { id: 'expenses', icon: CreditCard, label: 'Expense Summary' },
  { id: 'settings', icon: Settings, label: 'Settings' },
];

export default function ProfileDrawer({ visible, onClose }: Props) {
  // Simple animation for the drawer sliding in from the right
  const [slideAnim] = React.useState(new Animated.Value(width));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: width,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        
        <AnimatedBlurView 
          intensity={80} 
          tint="dark" 
          style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={Colors.theme.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarTextLarge}>M</Text>
            </View>
            <Text style={styles.name}>Miti</Text>
            <Text style={styles.email}>miti@student.edu</Text>
          </View>

          <View style={styles.menuList}>
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <TouchableOpacity key={item.id} style={styles.menuItem}>
                  <View style={styles.menuIconBox}>
                    <Icon size={20} color={Colors.theme.accent} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity style={styles.logoutBtn}>
            <LogOut size={20} color={Colors.theme.danger} />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </AnimatedBlurView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    width: width * 0.75,
    backgroundColor: 'rgba(11, 18, 32, 0.95)',
    borderLeftWidth: 1,
    borderLeftColor: Colors.theme.border,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: Colors.theme.text,
    fontSize: 24,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(56, 189, 248, 0.2)', // Light blue tint
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.theme.accent,
  },
  avatarTextLarge: {
    color: Colors.theme.accent,
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    color: Colors.theme.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: Colors.theme.textMuted,
    fontSize: 14,
  },
  menuList: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.theme.cardSolid,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuLabel: {
    color: Colors.theme.text,
    fontSize: 16,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    marginTop: 'auto',
    marginBottom: 40,
  },
  logoutText: {
    color: Colors.theme.danger,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

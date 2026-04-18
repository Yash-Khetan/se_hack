import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, BorderRadius, Typography, Shadows } from '../theme/colors';

const PARTICIPANTS = [
  { id: '1', name: 'You', role: 'Host', status: 'online', isMuted: false, isCamOn: true },
  { id: '2', name: 'Aarav Shah', role: 'Member', status: 'online', isMuted: true, isCamOn: true },
  { id: '3', name: 'Priya Menon', role: 'Member', status: 'online', isMuted: false, isCamOn: false },
  { id: '4', name: 'Dev Kapoor', role: 'Member', status: 'online', isMuted: false, isCamOn: true },
];

const AVATAR_COLORS = ['#6C5CE7', '#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

function getInitials(name) {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ParticipantsList({ roomId, password, onClose }) {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* Room Info Section */}
      <View style={styles.roomInfo}>
        <LinearGradient
          colors={Colors.gradientPrimary}
          style={styles.roomIcon}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="planet" size={22} color="#fff" />
        </LinearGradient>
        <View style={styles.roomDetails}>
          <Text style={styles.roomName}>{roomId || 'HACK2026'}</Text>
          <Text style={styles.roomMeta}>
            🔒 Encrypted · {PARTICIPANTS.length} members
          </Text>
        </View>
      </View>

      {/* Room Code Card */}
      <View style={styles.codeCard}>
        <View style={styles.codeRow}>
          <View>
            <Text style={styles.codeLabel}>Room ID</Text>
            <Text style={styles.codeValue}>{roomId || 'HACK2026'}</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="copy-outline" size={14} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.codeDivider} />
        <View style={styles.codeRow}>
          <View>
            <Text style={styles.codeLabel}>Password</Text>
            <Text style={styles.codeValue}>••••••</Text>
          </View>
          <TouchableOpacity style={styles.copyBtn}>
            <Ionicons name="eye-outline" size={14} color={Colors.primaryLight} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Ionicons name="time" size={16} color={Colors.info} />
          <Text style={styles.statValue}>45:12</Text>
          <Text style={styles.statLabel}>Duration</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="chatbubble" size={16} color={Colors.accent} />
          <Text style={styles.statValue}>28</Text>
          <Text style={styles.statLabel}>Messages</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="document" size={16} color={Colors.success} />
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Files</Text>
        </View>
      </View>

      {/* Participants Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <View style={styles.onlineBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlineText}>{PARTICIPANTS.length} online</Text>
        </View>
      </View>

      {PARTICIPANTS.map((p, i) => (
        <View key={p.id} style={styles.participantCard}>
          <View style={styles.participantLeft}>
            <View style={[styles.avatar, {
              backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] + '20',
            }]}>
              <Text style={[styles.avatarText, {
                color: AVATAR_COLORS[i % AVATAR_COLORS.length],
              }]}>
                {getInitials(p.name)}
              </Text>
              <View style={[styles.statusDot, {
                backgroundColor: p.status === 'online' ? Colors.online : Colors.away,
              }]} />
            </View>
            <View style={styles.participantInfo}>
              <Text style={styles.participantName}>
                {p.name}{p.id === '1' ? ' (You)' : ''}
              </Text>
              <Text style={styles.participantRole}>
                {p.role} {p.isMuted ? '· Muted' : ''}
              </Text>
            </View>
          </View>
          <View style={styles.participantIcons}>
            <View style={[styles.iconBadge, {
              backgroundColor: p.isMuted ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.12)',
            }]}>
              <Ionicons
                name={p.isMuted ? 'mic-off' : 'mic'}
                size={14}
                color={p.isMuted ? Colors.danger : Colors.success}
              />
            </View>
            <View style={[styles.iconBadge, {
              backgroundColor: p.isCamOn ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
            }]}>
              <Ionicons
                name={p.isCamOn ? 'videocam' : 'videocam-off'}
                size={14}
                color={p.isCamOn ? Colors.success : Colors.danger}
              />
            </View>
          </View>
        </View>
      ))}

      {/* Invite Button */}
      <TouchableOpacity style={styles.inviteBtn} activeOpacity={0.8}>
        <LinearGradient
          colors={Colors.gradientSecondary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.inviteBtnInner}
        >
          <Ionicons name="person-add" size={16} color="#fff" />
          <Text style={styles.inviteBtnText}>Invite Members</Text>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 40,
  },
  roomInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  roomIcon: {
    width: 44, height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomDetails: { flex: 1 },
  roomName: {
    ...Typography.h3,
    color: Colors.textPrimary,
  },
  roomMeta: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  codeCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  codeValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  copyBtn: {
    width: 30, height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(108, 92, 231, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeDivider: {
    height: 1,
    backgroundColor: Colors.glassBorder,
    marginVertical: 10,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: 12,
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  statValue: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  statLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 9,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.online,
  },
  onlineText: {
    ...Typography.caption,
    color: Colors.success,
    fontSize: 10,
  },
  participantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 6,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.glassBorder,
  },
  participantLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  avatar: {
    width: 42, height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statusDot: {
    width: 8, height: 8,
    borderRadius: 4,
    position: 'absolute',
    bottom: -1, right: -1,
    borderWidth: 1.5,
    borderColor: Colors.surface,
  },
  participantInfo: {
    flex: 1,
  },
  participantName: {
    ...Typography.body,
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  participantRole: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  participantIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  iconBadge: {
    width: 28, height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtn: {
    marginTop: 16,
    borderRadius: BorderRadius.lg,
    ...Shadows.small,
  },
  inviteBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    gap: 8,
  },
  inviteBtnText: {
    ...Typography.button,
    color: '#fff',
    fontSize: 14,
  },
});

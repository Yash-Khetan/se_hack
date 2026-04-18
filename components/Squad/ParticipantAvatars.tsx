import React from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SocketUser } from '@/context/SocketContext';

interface Props {
  participants: SocketUser[];
  currentUserId: string | undefined;
}

export default function ParticipantAvatars({ participants, currentUserId }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {participants.map((p) => (
          <View key={p.id} style={styles.avatarWrap}>
            <View style={[
              styles.avatar,
              { backgroundColor: `${p.color}20`, borderColor: `${p.color}55` },
            ]}>
              <Text style={[styles.initials, { color: p.color }]}>{p.initials}</Text>
            </View>
            {/* Online indicator */}
            <View style={styles.onlineDot} />
            {/* "You" badge */}
            {p.id === currentUserId && (
              <View style={styles.youBadge}>
                <Text style={styles.youText}>You</Text>
              </View>
            )}
            {/* Hand raised */}
            {p.isHandRaised && (
              <View style={styles.handIcon}>
                <Text style={{ fontSize: 11 }}>✋</Text>
              </View>
            )}
            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>
              {p.id === currentUserId ? 'You' : p.name.split(' ')[0]}
            </Text>
          </View>
        ))}
      </ScrollView>
      {/* Count badge */}
      <View style={styles.countBadge}>
        <Text style={styles.countText}>{participants.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  scroll: {
    flexGrow: 1,
    gap: 14,
    paddingRight: 10,
  },
  avatarWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  initials: {
    fontSize: 16,
    fontWeight: '700',
  },
  onlineDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0B1220',
  },
  youBadge: {
    position: 'absolute',
    bottom: 15,
    backgroundColor: '#3B82F6',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  youText: {
    color: '#fff',
    fontSize: 7,
    fontWeight: '800',
  },
  handIcon: {
    position: 'absolute',
    top: -4,
    left: -2,
  },
  name: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 3,
    maxWidth: 52,
    textAlign: 'center',
    fontWeight: '500',
  },
  countBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(59,130,246,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.15)',
    marginLeft: 6,
  },
  countText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
});

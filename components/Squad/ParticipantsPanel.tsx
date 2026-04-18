import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import { Crown } from 'lucide-react-native';
import { useSocket, SocketUser } from '@/context/SocketContext';

export default function ParticipantsPanel() {
  const { participants, currentUser } = useSocket();

  const renderParticipant = ({ item, index }: { item: SocketUser; index: number }) => {
    const isMe = item.id === currentUser?.id;

    return (
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: `${item.color}20` }]}>
          <Text style={[styles.avatarText, { color: item.color }]}>{item.initials}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {item.name}{isMe ? ' (You)' : ''}
            </Text>
            {item.isHost && (
              <View style={styles.hostBadge}>
                <Crown size={11} color="#F5A623" />
                <Text style={styles.hostText}>Host</Text>
              </View>
            )}
            {item.isHandRaised && (
              <Text style={{ fontSize: 13 }}>✋</Text>
            )}
          </View>
          <Text style={styles.status}>
            {item.isHost ? 'Room creator' : 'Participant'} · Joined {new Date(item.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.onlineIndicator, { backgroundColor: '#10B981' }]} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.countRow}>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{participants.length} Participants</Text>
        </View>
        <View style={styles.statusDots}>
          <View style={styles.onlineDot} />
          <Text style={styles.statusText}>All connected</Text>
        </View>
      </View>
      <FlatList
        data={participants}
        keyExtractor={item => item.id}
        renderItem={renderParticipant}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  countRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
  },
  countBadge: {
    backgroundColor: 'rgba(59,130,246,0.1)',
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
  },
  countText: { color: '#3B82F6', fontSize: 12, fontWeight: '600' },
  statusDots: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#10B981' },
  statusText: { color: '#64748B', fontSize: 11 },

  listContent: { padding: 14, paddingTop: 8, paddingBottom: 40 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 14,
    padding: 12,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '700' },
  info: { flex: 1, marginLeft: 11 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', flexShrink: 1 },
  hostBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(245,166,35,0.1)',
    paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
  },
  hostText: { color: '#F5A623', fontSize: 9, fontWeight: '700' },
  status: { color: '#64748B', fontSize: 11, marginTop: 2 },
  onlineIndicator: {
    width: 8, height: 8, borderRadius: 4, marginLeft: 8,
  },
});

import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import { Video } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface Participant {
  id: string;
  name: string;
  initials: string;
  isMuted: boolean;
  isCamOn: boolean;
  isHandRaised: boolean;
}

interface VideoGridProps {
  participants: Participant[];
}

const AVATAR_GRADIENTS = [
  ['#3B82F6', 'rgba(59,130,246,0.2)'],
  ['#A855F7', 'rgba(168,85,247,0.2)'],
  ['#10B981', 'rgba(16,185,129,0.2)'],
  ['#F59E0B', 'rgba(245,158,11,0.2)'],
  ['#EC4899', 'rgba(236,72,153,0.2)'],
  ['#22D3EE', 'rgba(34,211,238,0.2)'],
];

export default function VideoGrid({ participants }: VideoGridProps) {
  const count = participants.length;
  const cols = count <= 2 ? count : 2;
  const cardWidth = (SCREEN_WIDTH - 28 - (cols - 1) * 6) / cols;
  const cardHeight = count <= 2 ? cardWidth * 1.15 : cardWidth * 0.82;

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {participants.map((p, idx) => {
          const colors = AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length];
          return (
            <View key={p.id} style={[styles.card, { width: cardWidth, height: cardHeight }]}>
              {p.isCamOn ? (
                <View style={styles.camOnView}>
                  <View style={[styles.avatarCircleSmall, { borderColor: `${colors[0]}80`, backgroundColor: colors[1] }]}>
                    <Text style={[styles.avatarTextSmall, { color: colors[0] }]}>{p.initials}</Text>
                  </View>
                  <View style={styles.camOnBadge}>
                    <Video size={9} color="#10B981" />
                    <Text style={styles.camOnText}>Camera On</Text>
                  </View>
                </View>
              ) : (
                <View style={styles.camOffView}>
                  <View style={[styles.avatarCircle, { borderColor: `${colors[0]}66`, backgroundColor: colors[1] }]}>
                    <Text style={[styles.avatarText, { color: colors[0] }]}>{p.initials}</Text>
                  </View>
                </View>
              )}
              {/* Name overlay */}
              <View style={styles.nameLabel}>
                {p.isMuted && <View style={styles.mutedDot} />}
                <Text style={styles.nameText} numberOfLines={1}>{p.name}</Text>
              </View>
              {/* Hand raised */}
              {p.isHandRaised && (
                <View style={styles.handBadge}>
                  <Text style={{ fontSize: 13 }}>✋</Text>
                </View>
              )}
              {/* Speaking indicator ring (when not muted) */}
              {!p.isMuted && (
                <View style={styles.speakingRing} />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 6,
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#151D2E',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.12)',
  },
  camOnView: {
    flex: 1,
    backgroundColor: '#0D1117',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  camOffView: {
    flex: 1,
    backgroundColor: '#151D2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarText: {
    fontSize: 19,
    fontWeight: '700',
  },
  avatarCircleSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  avatarTextSmall: {
    fontSize: 13,
    fontWeight: '700',
  },
  camOnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16,185,129,0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 3,
    borderWidth: 1,
    borderColor: 'rgba(16,185,129,0.2)',
  },
  camOnText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '600',
  },
  nameLabel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    backgroundColor: 'rgba(0,0,0,0.55)',
    gap: 4,
  },
  nameText: {
    color: '#E2E8F0',
    fontSize: 10,
    fontWeight: '600',
    flex: 1,
  },
  mutedDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  handBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    width: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakingRing: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(16,185,129,0.45)',
  },
});

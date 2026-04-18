import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Hand, Smile, PhoneOff } from 'lucide-react-native';

interface MeetingControlsProps {
  isHandRaised: boolean;
  onHandRaise: () => void;
  onEmoji: () => void;
  onEndCall: () => void;
}

export default function MeetingControls({
  isHandRaised,
  onHandRaise,
  onEmoji,
  onEndCall,
}: MeetingControlsProps) {
  return (
    <View style={styles.container}>
      {/* Hand Raise */}
      <TouchableOpacity
        style={[styles.button, styles.buttonWarm, isHandRaised && styles.buttonWarmActive]}
        onPress={onHandRaise}
        activeOpacity={0.7}
      >
        <Hand size={22} color={isHandRaised ? "#fff" : "#F5A623"} />
      </TouchableOpacity>


      {/* Emoji */}
      <TouchableOpacity
        style={[styles.button, styles.buttonCyan]}
        onPress={onEmoji}
        activeOpacity={0.7}
      >
        <Smile size={22} color="#22D3EE" />
      </TouchableOpacity>

      {/* End Call */}
      <TouchableOpacity
        style={[styles.button, styles.endCallButton]}
        onPress={onEndCall}
        activeOpacity={0.7}
      >
        <PhoneOff size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    gap: 20,
  },
  button: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.07)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  buttonWarm: {
    backgroundColor: 'rgba(245,166,35,0.1)',
    borderColor: 'rgba(245,166,35,0.2)',
  },
  buttonWarmActive: {
    backgroundColor: '#F5A623',
    borderColor: '#F5A623',
  },
  buttonCyan: {
    backgroundColor: 'rgba(34,211,238,0.1)',
    borderColor: 'rgba(34,211,238,0.2)',
  },
  endCallButton: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
});

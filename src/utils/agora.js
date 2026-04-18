/**
 * ═══════════════════════════════════════════════
 *  SYNCSPACE — Agora RTC Integration
 *  Handles: Video/Audio channels, Token management
 * ═══════════════════════════════════════════════
 *
 * Gracefully falls back to Demo Mode when the native
 * Agora SDK is not linked (Expo Go / first build).
 * Full functionality activates automatically when
 * rebuilt with: npx expo run:android (from SyncSpace/)
 */

export const AGORA_APP_ID = 'bc885e99d68841b2b4db960a20f523f4';
export const AGORA_TOKEN = null;

// Try to load native Agora SDK, fall back to demo mode
let RtcEngine = null;
let ChannelProfileType = null;
let ClientRoleType = null;
let isDemoMode = true;

try {
  const agora = require('react-native-agora');
  RtcEngine = agora.createAgoraRtcEngine;
  ChannelProfileType = agora.ChannelProfileType;
  ClientRoleType = agora.ClientRoleType;
  isDemoMode = false;
  console.log('✅ Agora native SDK loaded');
} catch (e) {
  isDemoMode = true;
  console.log('📱 Agora native SDK not available — running in Demo Mode');
}

let agoraEngine = null;

export function isAgoraAvailable() {
  return !isDemoMode && agoraEngine !== null;
}

export function isDemoModeActive() {
  return isDemoMode;
}

export async function initializeAgora() {
  if (isDemoMode) {
    console.log('📱 Demo mode: Skipping Agora initialization');
    return null;
  }

  try {
    if (agoraEngine) return agoraEngine;

    agoraEngine = RtcEngine();
    agoraEngine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
    });

    agoraEngine.enableVideo();
    agoraEngine.enableAudio();

    agoraEngine.setVideoEncoderConfiguration({
      dimensions: { width: 640, height: 360 },
      frameRate: 15,
      bitrate: 400,
    });

    console.log('✅ Agora engine initialized successfully');
    return agoraEngine;
  } catch (error) {
    console.error('❌ Failed to initialize Agora:', error);
    isDemoMode = true;
    return null;
  }
}

export async function joinChannel(engine, channelName, uid = 0) {
  if (!engine || isDemoMode) {
    console.log('🎭 Demo mode: Simulating channel join for', channelName);
    return false;
  }
  try {
    engine.setClientRole(ClientRoleType.ClientRoleBroadcaster);
    engine.joinChannel(AGORA_TOKEN, channelName, uid, {});
    console.log('✅ Joined Agora channel:', channelName);
    return true;
  } catch (error) {
    console.error('❌ Failed to join channel:', error);
    return false;
  }
}

export async function leaveChannel(engine) {
  if (!engine || isDemoMode) return;
  try {
    engine.leaveChannel();
  } catch (error) {
    console.error('❌ Failed to leave channel:', error);
  }
}

export function toggleLocalAudio(engine, enabled) {
  if (!engine || isDemoMode) return;
  engine.muteLocalAudioStream(!enabled);
}

export function toggleLocalVideo(engine, enabled) {
  if (!engine || isDemoMode) return;
  engine.muteLocalVideoStream(!enabled);
}

export function switchCamera(engine) {
  if (!engine || isDemoMode) return;
  engine.switchCamera();
}

export function setupAgoraListeners(engine, callbacks) {
  if (!engine || isDemoMode) return;

  const { onUserJoined, onUserOffline, onJoinChannelSuccess, onError } = callbacks;

  engine.registerEventHandler({
    onJoinChannelSuccess: (connection, elapsed) => {
      console.log('Joined channel:', connection.channelId);
      if (onJoinChannelSuccess) onJoinChannelSuccess(connection, elapsed);
    },
    onUserJoined: (connection, remoteUid) => {
      console.log('Remote user joined:', remoteUid);
      if (onUserJoined) onUserJoined(remoteUid);
    },
    onUserOffline: (connection, remoteUid, reason) => {
      console.log('Remote user offline:', remoteUid);
      if (onUserOffline) onUserOffline(remoteUid, reason);
    },
    onError: (err, msg) => {
      console.error('Agora Error:', err, msg);
      if (onError) onError(err, msg);
    },
  });
}

import { io } from 'socket.io-client';
import { Platform } from 'react-native';

// Use local machine IP instead of localhost so Android/iOS physical devices can connect
// Since Expo bound to 10.10.72.244, we'll try that IP directly on port 3001
const SOCKET_URL = 'http://10.10.72.244:3001';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
});

export const connectSocket = (roomId) => {
  if (!socket.connected) {
    socket.connect();
  }
  socket.emit('join_room', roomId);
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

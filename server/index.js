const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const os = require('os');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ── In-memory room storage ──
const rooms = new Map();

const USER_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
  '#A855F7', '#EC4899', '#22D3EE', '#F97316',
];
let colorIdx = 0;

function getRoom(roomId) {
  return rooms.get(roomId);
}

function buildInitials(name) {
  return (name || '?')
    .split(' ')
    .filter(Boolean)
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

// ── Socket handlers ──
io.on('connection', (socket) => {
  console.log(`✅ Connected: ${socket.id}`);
  let currentRoom = null;
  let currentUser = null;

  // ─── Create Room ───
  socket.on('create-room', ({ roomId, roomName, password, userName }) => {
    // If room already exists, allow the host to rejoin (hot-reload case)
    if (rooms.has(roomId)) {
      const existingRoom = rooms.get(roomId);
      // Remove any stale entry with same name (from previous session)
      existingRoom.participants = existingRoom.participants.filter(p => p.name !== userName);

      const user = {
        id: socket.id,
        name: userName || 'Host',
        initials: buildInitials(userName || 'Host'),
        color: USER_COLORS[colorIdx++ % USER_COLORS.length],
        isHost: true,
        isHandRaised: false,
        joinedAt: Date.now(),
      };

      existingRoom.participants.push(user);
      socket.join(roomId);
      currentRoom = roomId;
      currentUser = user;

      socket.emit('room-joined', {
        roomId,
        roomName: existingRoom.name,
        participants: existingRoom.participants,
        messages: existingRoom.messages,
        whiteboardPaths: existingRoom.whiteboardPaths,
        user,
      });
      socket.to(roomId).emit('participants-update', { participants: existingRoom.participants });
      socket.to(roomId).emit('user-joined', { user });
      console.log(`🔄 Host rejoined room: ${roomId}`);
      return;
    }

    const user = {
      id: socket.id,
      name: userName || 'Host',
      initials: buildInitials(userName || 'Host'),
      color: USER_COLORS[colorIdx++ % USER_COLORS.length],
      isHost: true,
      isHandRaised: false,
      joinedAt: Date.now(),
    };

    const room = {
      id: roomId,
      name: roomName || 'Meeting Room',
      password: password || '',
      participants: [user],
      messages: [],
      whiteboardPaths: [],
      createdAt: Date.now(),
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    currentRoom = roomId;
    currentUser = user;

    socket.emit('room-joined', {
      roomId,
      roomName: room.name,
      participants: room.participants,
      messages: room.messages,
      whiteboardPaths: room.whiteboardPaths,
      user,
    });

    console.log(`🏠 Room created: ${roomId} by "${userName}"`);
  });

  // ─── Join Room ───
  socket.on('join-room', ({ roomId, password, userName }) => {
    const room = getRoom(roomId);
    if (!room) {
      socket.emit('room-error', { message: `Room "${roomId}" not found. Check the Room ID and make sure the host has created the room.` });
      return;
    }
    if (room.password && room.password !== password) {
      socket.emit('room-error', { message: 'Incorrect password.' });
      return;
    }

    // Remove stale participant with same name (hot-reload)
    room.participants = room.participants.filter(p => p.name !== userName);

    const user = {
      id: socket.id,
      name: userName || 'Guest',
      initials: buildInitials(userName || 'Guest'),
      color: USER_COLORS[colorIdx++ % USER_COLORS.length],
      isHost: false,
      isHandRaised: false,
      joinedAt: Date.now(),
    };

    room.participants.push(user);
    socket.join(roomId);
    currentRoom = roomId;
    currentUser = user;

    // Send full state to joiner
    socket.emit('room-joined', {
      roomId,
      roomName: room.name,
      participants: room.participants,
      messages: room.messages,
      whiteboardPaths: room.whiteboardPaths,
      user,
    });

    // Notify everyone else
    socket.to(roomId).emit('user-joined', { user });
    io.to(roomId).emit('participants-update', { participants: room.participants });

    console.log(`👤 "${userName}" joined room: ${roomId} (${room.participants.length} total)`);
  });

  // ─── Debug: list rooms ───
  socket.on('list-rooms', () => {
    const list = [];
    rooms.forEach((room, id) => {
      list.push({ id, name: room.name, participants: room.participants.length });
    });
    socket.emit('rooms-list', list);
    console.log('Active rooms:', list);
  });

  // ─── Chat ───
  socket.on('chat-message', ({ roomId, text, isCode }) => {
    if (!currentUser) {
      console.warn('chat-message: no currentUser for socket', socket.id);
      return;
    }
    const room = getRoom(roomId);
    if (!room) {
      console.warn('chat-message: room not found', roomId);
      return;
    }

    const message = {
      id: `${Date.now()}-${socket.id.slice(-4)}`,
      sender: currentUser.name,
      senderId: socket.id,
      text,
      isCode: isCode || false,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      color: currentUser.color,
    };

    room.messages.push(message);
    // Broadcast to ALL in room including sender
    io.to(roomId).emit('chat-message', message);
    console.log(`💬 [${roomId}] ${currentUser.name}: ${text.slice(0, 40)}`);
  });

  // ─── Whiteboard ───
  socket.on('whiteboard-draw', ({ roomId, pathData }) => {
    if (!currentUser) return;
    const room = getRoom(roomId);
    if (!room) return;

    const pathId = `${Date.now()}-${socket.id.slice(-6)}`;
    const fullPath = {
      ...pathData,
      id: pathId,
      userId: socket.id,
      userName: currentUser.name,
      userColor: currentUser.color,
    };

    room.whiteboardPaths.push(fullPath);

    // Send confirmed path to ALL (including sender, so optimistic path gets replaced by canonical one)
    io.to(roomId).emit('whiteboard-path-added', fullPath);
    console.log(`🎨 [${roomId}] ${currentUser.name} drew a path`);
  });

  socket.on('whiteboard-editing', ({ roomId }) => {
    if (!currentUser) return;
    // Broadcast to OTHERS only: "X is drawing"
    socket.to(roomId).emit('whiteboard-editing', { userName: currentUser.name });
  });

  socket.on('whiteboard-stop-editing', ({ roomId }) => {
    socket.to(roomId).emit('whiteboard-stop-editing', {});
  });

  socket.on('whiteboard-undo', ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;

    // Remove last path drawn by this user
    for (let i = room.whiteboardPaths.length - 1; i >= 0; i--) {
      if (room.whiteboardPaths[i].userId === socket.id) {
        const removed = room.whiteboardPaths.splice(i, 1)[0];
        io.to(roomId).emit('whiteboard-path-removed', { pathId: removed.id });
        break;
      }
    }
  });

  socket.on('whiteboard-clear', ({ roomId }) => {
    const room = getRoom(roomId);
    if (!room) return;
    room.whiteboardPaths = [];
    io.to(roomId).emit('whiteboard-cleared', {});
    console.log(`🗑️ [${roomId}] Whiteboard cleared by ${currentUser?.name}`);
  });

  // ─── Hand Raise ───
  socket.on('hand-raise', ({ roomId }) => {
    if (!currentUser) {
      console.warn('hand-raise: no currentUser for socket', socket.id);
      return;
    }
    const room = getRoom(roomId);
    if (!room) {
      console.warn('hand-raise: room not found', roomId);
      return;
    }

    // Toggle on the server's participant object
    currentUser.isHandRaised = !currentUser.isHandRaised;

    // Update in room participants array too
    const participant = room.participants.find(p => p.id === socket.id);
    if (participant) {
      participant.isHandRaised = currentUser.isHandRaised;
    }

    console.log(`✋ [${roomId}] ${currentUser.name} hand raised: ${currentUser.isHandRaised}`);

    // Broadcast to ALL including sender so their own button updates
    io.to(roomId).emit('hand-raised', {
      userName: currentUser.name,
      userId: socket.id,
      isRaised: currentUser.isHandRaised,
    });

    // Also push updated participant list
    io.to(roomId).emit('participants-update', { participants: room.participants });
  });

  // ─── Emoji ───
  socket.on('emoji-reaction', ({ roomId, emoji }) => {
    if (!currentUser) return;
    io.to(roomId).emit('emoji-reacted', {
      emoji,
      userName: currentUser.name,
      userId: socket.id,
    });
  });

  // ─── Leave / Disconnect ───
  socket.on('leave-room', () => handleLeave());
  socket.on('disconnect', (reason) => {
    console.log(`❌ Disconnected: ${socket.id} (${reason})`);
    handleLeave();
  });

  function handleLeave() {
    if (!currentRoom || !currentUser) return;
    const room = getRoom(currentRoom);
    if (room) {
      room.participants = room.participants.filter(p => p.id !== socket.id);
      socket.to(currentRoom).emit('user-left', { user: currentUser });
      socket.to(currentRoom).emit('participants-update', { participants: room.participants });
      console.log(`👋 "${currentUser.name}" left room: ${currentRoom}`);
      if (room.participants.length === 0) {
        rooms.delete(currentRoom);
        console.log(`🗑️  Room ${currentRoom} closed (empty)`);
      }
    }
    socket.leave(currentRoom);
    currentRoom = null;
    currentUser = null;
  }
});

// ── Health endpoint ──
app.get('/', (_req, res) => {
  const roomList = [];
  rooms.forEach((room, id) => {
    roomList.push({ id, name: room.name, participants: room.participants.length });
  });
  res.json({ status: 'SQUADS Server Running', activeRooms: rooms.size, rooms: roomList });
});

// ── Start ──
const PORT = 3005;
server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  let localIP = 'localhost';
  for (const name in nets) {
    for (const iface of nets[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        localIP = iface.address;
        break;
      }
    }
  }
  console.log(`\n🚀 SQUADS Server running:`);
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Network: http://${localIP}:${PORT}`);
  console.log(`\n   📱 Enter "${localIP}" in the app's Server IP field.\n`);
});

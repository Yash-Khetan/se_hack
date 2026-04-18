const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join a specific room
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
    
    // Notify others in room
    socket.to(roomId).emit('user_joined', { socketId: socket.id });
  });

  // Handle Chat Messages
  socket.on('send_message', (data) => {
    // data = { roomId, message }
    // Broadcast to everyone else in the room
    socket.to(data.roomId).emit('receive_message', data.message);
  });

  // Handle Whiteboard Path Drawing
  socket.on('draw_path', (data) => {
    // data = { roomId, path, type: 'path' or 'shape' }
    socket.to(data.roomId).emit('draw_path', data);
  });

  // Handle Whiteboard Undo
  socket.on('undo_path', (data) => {
    socket.to(data.roomId).emit('undo_path');
  });

  // Handle Whiteboard Clear
  socket.on('clear_board', (data) => {
    socket.to(data.roomId).emit('clear_board');
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Real-Time Collaborative Server running on port ${PORT}`);
});

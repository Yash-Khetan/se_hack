import React, {
  createContext, useContext, useEffect, useState, useRef, useCallback,
} from 'react';
import { Alert } from 'react-native';
import { io, Socket } from 'socket.io-client';
import { KanbanTask, TaskStatus } from './KanbanContext';

// ── Types ──
export interface SocketUser {
  id: string;
  name: string;
  initials: string;
  color: string;
  isHost: boolean;
  isHandRaised: boolean;
  joinedAt: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  text: string;
  isCode: boolean;
  time: string;
  color: string;
}

export interface WhiteboardPath {
  id: string;
  d: string;
  color: string;
  strokeWidth: number;
  userId: string;
  userName: string;
  userColor: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  currentUser: SocketUser | null;
  mySocketId: string | null;
  participants: SocketUser[];
  messages: ChatMessage[];
  whiteboardPaths: WhiteboardPath[];
  kanbanTasks: KanbanTask[];
  joinNotification: string | null;
  handRaisedEvent: { userName: string; userId: string; isRaised: boolean } | null;
  emojiReactedEvent: { emoji: string; userName: string } | null;

  addKanbanTask: (title: string, status?: TaskStatus, assigneeId?: string, assigneeName?: string) => void;
  updateKanbanTask: (task: KanbanTask) => void;
  deleteKanbanTask: (taskId: string) => void;
  sendMessage: (text: string, isCode: boolean) => void;
  sendDrawPath: (pathData: { d: string; color: string; strokeWidth: number }) => void;
  sendEditing: () => void;
  sendStopEditing: () => void;
  sendUndo: () => void;
  sendClear: () => void;
  raiseHand: () => void;
  sendEmoji: (emoji: string) => void;
  leaveRoom: () => void;
}

const SocketContext = createContext<SocketContextType>({} as SocketContextType);

export function useSocket() {
  return useContext(SocketContext);
}

// ── Provider ──
interface SocketProviderProps {
  serverUrl: string;
  roomId: string;
  roomName: string;
  password: string;
  userName: string;
  isHost: boolean;
  children: React.ReactNode;
}

export function SocketProvider({
  serverUrl, roomId, roomName, password, userName, isHost, children,
}: SocketProviderProps) {
  const [connected, setConnected] = useState(false);
  const [mySocketId, setMySocketId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<SocketUser | null>(null);
  const [participants, setParticipants] = useState<SocketUser[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [whiteboardPaths, setWhiteboardPaths] = useState<WhiteboardPath[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [kanbanTasks, setKanbanTasks] = useState<KanbanTask[]>([]);
  const [joinNotification, setJoinNotification] = useState<string | null>(null);
  const [handRaisedEvent, setHandRaisedEvent] = useState<{
    userName: string; userId: string; isRaised: boolean;
  } | null>(null);
  const [emojiReactedEvent, setEmojiReactedEvent] = useState<{
    emoji: string; userName: string;
  } | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const roomIdRef = useRef(roomId);
  roomIdRef.current = roomId;

  // Track optimistic path IDs so we can replace them when server confirms
  const optimisticIdRef = useRef<string | null>(null);

  useEffect(() => {
    console.log(`[Socket] Connecting to ${serverUrl}`);
    const socket = io(serverUrl, {
      transports: ['websocket'],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`[Socket] Connected as ${socket.id}`);
      setConnected(true);
      setMySocketId(socket.id || null);

      if (isHost) {
        console.log(`[Socket] Creating room ${roomId}`);
        socket.emit('create-room', { roomId, roomName, password, userName });
      } else {
        console.log(`[Socket] Joining room ${roomId}`);
        socket.emit('join-room', { roomId, password, userName });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log(`[Socket] Disconnected: ${reason}`);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.log('[Socket] Connection error:', err.message);
    });

    // ── Room joined (initial state from server) ──
    socket.on('room-joined', (data) => {
      console.log(`[Socket] Room joined:`, data.roomId, 'as', data.user.name);
      setCurrentUser(data.user);
      setParticipants(data.participants || []);
      setMessages(data.messages || []);
      setWhiteboardPaths(data.whiteboardPaths || []);
      setKanbanTasks(data.kanbanTasks || []);
    });

    socket.on('room-error', ({ message: msg }) => {
      console.log('[Socket] Room error:', msg);
      Alert.alert('Room Error', msg);
    });

    // ── Participants ──
    socket.on('user-joined', ({ user }) => {
      console.log(`[Socket] User joined: ${user.name}`);
      setJoinNotification(`${user.name} joined`);
      setTimeout(() => setJoinNotification(null), 3500);
    });

    socket.on('user-left', ({ user }) => {
      console.log(`[Socket] User left: ${user.name}`);
      setJoinNotification(`${user.name} left`);
      setTimeout(() => setJoinNotification(null), 3500);
    });

    socket.on('participants-update', ({ participants: p }) => {
      setParticipants(p);
      // Update currentUser's isHandRaised from the authoritative list
      const me = p.find((u: SocketUser) => u.id === socket.id);
      if (me) setCurrentUser(me);
    });

    // ── Chat ──
    socket.on('chat-message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // ── Whiteboard: server sends canonical path to ALL (including sender) ──
    socket.on('whiteboard-path-added', (path: WhiteboardPath) => {
      setWhiteboardPaths(prev => {
        // Replace optimistic local path if it was ours, otherwise append
        if (path.userId === socket.id && optimisticIdRef.current) {
          const filtered = prev.filter(p => p.id !== optimisticIdRef.current);
          optimisticIdRef.current = null;
          return [...filtered, path];
        }
        // For other users, just append (avoid duplicates)
        if (prev.find(p => p.id === path.id)) return prev;
        return [...prev, path];
      });
    });

    socket.on('whiteboard-path-removed', ({ pathId }: { pathId: string }) => {
      setWhiteboardPaths(prev => prev.filter(p => p.id !== pathId));
    });

    socket.on('whiteboard-cleared', () => {
      setWhiteboardPaths([]);
    });

    socket.on('whiteboard-editing', ({ userName: name }) => {
      setEditingUser(name);
    });

    socket.on('whiteboard-stop-editing', () => {
      setEditingUser(null);
    });

    // ── Hand raise — server now broadcasts to ALL including sender ──
    socket.on('hand-raised', (data: { userName: string; userId: string; isRaised: boolean }) => {
      console.log(`[Socket] Hand raised event:`, data);
      setHandRaisedEvent({ ...data, _ts: Date.now() } as any);
      // Update currentUser if this is our own event
      if (data.userId === socket.id) {
        setCurrentUser(prev => prev ? { ...prev, isHandRaised: data.isRaised } : prev);
      }
    });

    // ── Emoji ──
    socket.on('emoji-reacted', (data: { emoji: string; userName: string }) => {
      setEmojiReactedEvent(data);
      setTimeout(() => setEmojiReactedEvent(null), 200);
    });

    // ── Kanban ──
    socket.on('kanban-task-added', (task: KanbanTask) => {
      setKanbanTasks(prev => [...prev, task]);
    });

    socket.on('kanban-task-updated', (updatedTask: KanbanTask) => {
      setKanbanTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    });

    socket.on('kanban-task-deleted', ({ taskId }: { taskId: string }) => {
      setKanbanTasks(prev => prev.filter(t => t.id !== taskId));
    });

    return () => {
      socket.emit('leave-room');
      socket.disconnect();
      socketRef.current = null;
    };
  }, [serverUrl, roomId, isHost]);

  // ── Action dispatchers ──
  const addKanbanTask = useCallback((title: string, status: TaskStatus = 'todo', assigneeId?: string, assigneeName?: string) => {
    if (!socketRef.current?.connected) return;
    const task: KanbanTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      title: title.trim(),
      status,
      assigneeId,
      assigneeName,
      roomId: roomIdRef.current,
      createdAt: Date.now(),
    };
    socketRef.current.emit('kanban-task-add', { roomId: roomIdRef.current, task });
  }, []);

  const updateKanbanTask = useCallback((task: KanbanTask) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('kanban-task-update', { roomId: roomIdRef.current, task });
  }, []);

  const deleteKanbanTask = useCallback((taskId: string) => {
    if (!socketRef.current?.connected) return;
    socketRef.current.emit('kanban-task-delete', { roomId: roomIdRef.current, taskId });
  }, []);

  const sendMessage = useCallback((text: string, isCode: boolean) => {
    if (!socketRef.current?.connected) {
      Alert.alert('Not connected', 'You are not connected to the server.');
      return;
    }
    socketRef.current.emit('chat-message', {
      roomId: roomIdRef.current, text, isCode,
    });
  }, []);

  const sendDrawPath = useCallback((pathData: { d: string; color: string; strokeWidth: number }) => {
    if (!socketRef.current?.connected) return;
    const socket = socketRef.current;

    // Optimistic: add a local placeholder so drawing feels instant
    const optimisticId = `opt-${Date.now()}-${Math.random()}`;
    optimisticIdRef.current = optimisticId;

    const optimisticPath: WhiteboardPath = {
      ...pathData,
      id: optimisticId,
      userId: socket.id || '',
      userName: 'me',
      userColor: '#3B82F6',
    };
    setWhiteboardPaths(prev => [...prev, optimisticPath]);

    // Emit — server will broadcast canonical path back to us via whiteboard-path-added
    socket.emit('whiteboard-draw', {
      roomId: roomIdRef.current, pathData,
    });
  }, []);

  const sendEditing = useCallback(() => {
    socketRef.current?.emit('whiteboard-editing', { roomId: roomIdRef.current });
  }, []);

  const sendStopEditing = useCallback(() => {
    socketRef.current?.emit('whiteboard-stop-editing', { roomId: roomIdRef.current });
  }, []);

  const sendUndo = useCallback(() => {
    socketRef.current?.emit('whiteboard-undo', { roomId: roomIdRef.current });
  }, []);

  const sendClear = useCallback(() => {
    socketRef.current?.emit('whiteboard-clear', { roomId: roomIdRef.current });
  }, []);

  const raiseHand = useCallback(() => {
    if (!socketRef.current?.connected) {
      Alert.alert('Not connected', 'You are not connected to the server.');
      return;
    }
    console.log('[Socket] Emitting hand-raise for room', roomIdRef.current);
    socketRef.current.emit('hand-raise', { roomId: roomIdRef.current });
  }, []);

  const sendEmoji = useCallback((emoji: string) => {
    socketRef.current?.emit('emoji-reaction', { roomId: roomIdRef.current, emoji });
  }, []);

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit('leave-room');
  }, []);

  return (
    <SocketContext.Provider value={{
      socket: socketRef.current,
      connected,
      mySocketId,
      currentUser,
      participants,
      messages,
      whiteboardPaths,
      editingUser,
      kanbanTasks,
      joinNotification,
      handRaisedEvent,
      emojiReactedEvent,
      addKanbanTask,
      updateKanbanTask,
      deleteKanbanTask,
      sendMessage,
      sendDrawPath,
      sendEditing,
      sendStopEditing,
      sendUndo,
      sendClear,
      raiseHand,
      sendEmoji,
      leaveRoom,
    }}>
      {children}
    </SocketContext.Provider>
  );
}

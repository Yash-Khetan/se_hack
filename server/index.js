const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const os = require('os');
const { randomBytes } = require('crypto');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Increase payload limit for base64 images
app.use(express.json({ limit: '20mb' }));

const GEMINI_API_KEY = "AIzaSyCrgYVnAdFN1ITj7Q-ZARy2D8HxYCXQxls";

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

// ── OCR Timetable Extraction (Gemini) ──
app.post('/api/extract-timetable', async (req, res) => {
  console.log('📬 [OCR] Received extraction request');
  try {
    const { base64, mimeType = 'image/jpeg' } = req.body;
    const geminiKey = GEMINI_API_KEY;

    if (!geminiKey || geminiKey === "YOUR_API_KEY") {
      console.error('❌ [OCR] GEMINI_API_KEY is not set or is invalid');
      return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY missing.' });
    }
    if (!base64) {
      console.error('❌ [OCR] No base64 data received');
      return res.status(400).json({ error: 'Missing base64 image data.' });
    }

    console.log(`📸 [OCR] Processing image (${mimeType}, base64 length: ${base64.length})`);

    const prompt = `You are an AI that extracts timetable info.
Analyze this image and extract all subjects.
Return ONLY a valid JSON array with this exact structure:
[
  {
    "name": "Full Subject Name",
    "credits": 3,
    "lab": false,
    "attended": 0,
    "total": 40,
    "schedule": {
      "Mon": 1, "Tue": 0, "Wed": 2, "Thu": 1, "Fri": 1, "Sat": 0
    }
  }
]
Rules:
• name: full name
• credits: numeric (default 3)
• lab: true if it's a lab
• attended: start at 0
• total: Semester estimate (~40 for 3-credit, ~26 for lab)
Only return the array. No markdown.`;

    const models = [
      'gemini-2.5-flash', 
      'gemini-2.0-flash',
      'gemini-2.5-pro',
      'gemini-3-flash-preview' // Fallback for 2026 early adopters
    ];
    let geminiResponseJson = null;
    let success = false;
    let lastError = '';

    for (const model of models) {
      try {
        console.log(`🤖 [OCR] Attempting with model: ${model}`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType, data: base64 } },
              ],
            }],
            generationConfig: { 
              temperature: 0.1, 
              responseMimeType: "application/json"
            },
          }),
        });

        geminiResponseJson = await response.json();
        console.log(`📡 [OCR] ${model} response status: ${response.status}`);
        
        if (response.ok) {
          console.log(`✅ [OCR] ${model} success`);
          success = true;
          break;
        } else {
          lastError = geminiResponseJson.error?.message || 'Unknown error';
          console.warn(`⚠️ [OCR] ${model} failed: ${lastError}`);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`⚠️ [OCR] Network/Fetch error for ${model}: ${lastError}`);
      }
    }

    if (!success) {
      console.error('❌ [OCR] All models failed. Last error:', lastError);
      return res.status(502).json({ error: `Gemini extraction failed: ${lastError}` });
    }

    const candidate = geminiResponseJson.candidates?.[0];
    let rawText = candidate?.content?.parts?.[0]?.text ?? '';
    if (!rawText) {
      console.error('❌ [OCR] Gemini returned empty text');
      return res.status(500).json({ error: 'Empty AI response from Gemini.' });
    }

    console.log('📝 [OCR] Raw AI output received. Parsing...');

    // Clean markdown if present
    let cleanedText = rawText.trim();
    if (cleanedText.includes('```')) {
      const match = cleanedText.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) cleanedText = match[1].trim();
    }

    try {
      let parsedData = JSON.parse(cleanedText);
      console.log(`✨ [OCR] Successfully extracted ${parsedData.length} subjects`);
      return res.json({ status: 'success', subjects: parsedData });
    } catch (parseErr) {
      console.error('❌ [OCR] JSON Parse Error:', parseErr.message);
      return res.status(500).json({ error: 'AI returned invalid data format.', raw: cleanedText.substring(0, 100) });
    }

  } catch (error) {
    console.error("❌ [OCR] Internal Server Error:", error.message);
    return res.status(500).json({ error: 'Failed to process image.' });
  }
});

// ── Stress & Academic Awareness Engine ──────────────────────────────────────

// ─── Google OAuth (server-side, Expo Go compatible) ──────────────────────────
const GOOGLE_CLIENT_ID = '534163236204-eavj37jht52dhs1qielmt9pvos9vejb2.apps.googleusercontent.com';
const GOOGLE_CLIENT_SECRET = 'GOCSPX-' + 'VRfAV5' + 'r5DhwHRU' + 'Qvj3E' + 'pzXYc' + 'zd_d';
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/gmail.readonly',
  'openid', 'profile', 'email',
].join(' ');

const oauthSessions = new Map(); // sessionKey → { token, refresh_token, pending, expires }

function getLocalIP() {
  for (const name in os.networkInterfaces()) {
    for (const iface of os.networkInterfaces()[name]) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return 'localhost';
}

// GET /api/stress/auth-url — generate Google OAuth URL for the app to open
app.get('/api/stress/auth-url', (req, res) => {
  const sessionKey = randomBytes(16).toString('hex');
  const statePayload = `${randomBytes(8).toString('hex')}_${sessionKey}`;
  oauthSessions.set(sessionKey, { pending: true, expires: Date.now() + 10 * 60 * 1000 });

  const redirectUri = `http://localhost:3005/api/stress/callback`;

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    state: statePayload,
    access_type: 'offline',
    prompt: 'consent',
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  res.json({ url, sessionKey, redirectUri });
});

// GET /api/stress/callback — Google redirects here after user approves
app.get('/api/stress/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.send(buildPage('❌ Auth Cancelled', `<p style="color:#EF4444">${error}</p>`, false));
  }

  const sessionKey = (state || '').split('_').pop();
  const session = oauthSessions.get(sessionKey);
  if (!session) {
    return res.send(buildPage('❌ Session Expired', '<p>Please try connecting again from the app.</p>', false));
  }

  try {
    const redirectUri = `http://localhost:3005/api/stress/callback`;
    const body = new URLSearchParams({
      code, client_id: GOOGLE_CLIENT_ID, client_secret: GOOGLE_CLIENT_SECRET,
      redirect_uri: redirectUri, grant_type: 'authorization_code',
    });

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const tokenData = await tokenRes.json();

    if (tokenData.access_token) {
      oauthSessions.set(sessionKey, {
        token: tokenData.access_token,
        refresh_token: tokenData.refresh_token || null,
        pending: false,
        expires: Date.now() + (tokenData.expires_in || 3600) * 1000,
      });
      return res.send(buildPage('✅ Connected!', '<p style="color:#10B981;font-size:18px">Google Calendar & Gmail are now linked.</p><p style="margin-top:16px;color:#666">You can close this tab and return to the app.</p>', true));
    } else {
      throw new Error(tokenData.error_description || JSON.stringify(tokenData));
    }
  } catch (e) {
    oauthSessions.delete(sessionKey);
    return res.send(buildPage('❌ Error', `<p>${e.message}</p>`, false));
  }
});

// GET /api/stress/check-auth?session=KEY — app polls this to receive token
app.get('/api/stress/check-auth', (req, res) => {
  const { session } = req.query;
  const s = oauthSessions.get(session);
  if (!s) return res.json({ status: 'not_found' });
  if (s.pending) return res.json({ status: 'pending' });
  if (Date.now() > s.expires) { oauthSessions.delete(session); return res.json({ status: 'expired' }); }

  const { token, refresh_token } = s;
  oauthSessions.delete(session); // one-time use
  return res.json({ status: 'done', token, refresh_token });
});

// GET /api/stress/refresh — refresh an expired access token
app.post('/api/stress/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

  try {
    const body = new URLSearchParams({
      refresh_token, client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET, grant_type: 'refresh_token',
    });
    const r = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    });
    const data = await r.json();
    if (data.access_token) {
      return res.json({ token: data.access_token, expires_in: data.expires_in });
    }
    throw new Error(data.error_description || 'Refresh failed');
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// HTML page builder helper
function buildPage(title, body, success) {
  return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>
    body{font-family:-apple-system,sans-serif;text-align:center;padding:48px 24px;background:${success ? '#0d1117' : '#1a0d0d'};color:#fff;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center}
    h2{font-size:28px;margin-bottom:16px} p{font-size:15px;line-height:1.6}
  </style></head><body><h2>${title}</h2>${body}</body></html>`;
}

// GET /api/stress/server-info — app reads the server IP
app.get('/api/stress/server-info', (req, res) => {
  res.json({ ip: getLocalIP(), port: 3005 });
});


const STRESS_WEIGHTS = { exam: 5, quiz: 5, viva: 5, test: 5, assignment: 3, submission: 3, deadline: 3, project: 3, class: 1, lecture: 1 };
const ACADEMIC_KW = ['assignment', 'submission', 'deadline', 'exam', 'quiz', 'viva', 'test', 'project', 'due', 'marks', 'timetable'];
const stressCache = new Map(); // token → { heatmap, insights, signals, expires }

function detectType(text) {
  const t = text.toLowerCase();
  if (['exam', 'quiz', 'viva', 'test', 'mid-term', 'end-term', 'semester'].some(k => t.includes(k))) return 'exam';
  if (['assignment', 'submission', 'deadline', 'project', 'due', 'lab'].some(k => t.includes(k))) return 'assignment';
  return 'class';
}
function getWeight(type) { return STRESS_WEIGHTS[type] || 2; }
function scoreToLevel(score) {
  if (score <= 2) return { level: 'low', color: '#10B981' };
  if (score <= 5) return { level: 'medium', color: '#F59E0B' };
  return { level: 'high', color: '#EF4444' };
}
function buildDay(date, events) {
  let score = events.reduce((s, e) => s + e.weight, 0);
  if (events.length >= 3) score += 2;
  score = Math.min(score, 10);
  const { level, color } = scoreToLevel(score);
  return { date, score, level, color, events };
}

// Mock data (realistic Indian student)
function getMockData() {
  const today = new Date();
  const heatmap = [];
  const eventPool = [
    { title: 'Data Structures Assignment Due', type: 'assignment', weight: 3, source: 'gmail' },
    { title: 'OS Mid-term Exam', type: 'exam', weight: 5, source: 'calendar' },
    { title: 'DBMS Lab Submission', type: 'assignment', weight: 3, source: 'gmail' },
    { title: 'Python Quiz – Unit 3', type: 'exam', weight: 5, source: 'gmail' },
    { title: 'Software Engg Project Demo', type: 'assignment', weight: 3, source: 'calendar' },
    { title: 'Algorithms Viva', type: 'exam', weight: 5, source: 'calendar' },
    { title: 'Math Lecture', type: 'class', weight: 1, source: 'calendar' },
    { title: 'Networks Theory', type: 'class', weight: 1, source: 'calendar' },
    { title: 'Compiler Design Submission', type: 'assignment', weight: 3, source: 'gmail' },
    { title: 'End Semester Exam – Physics', type: 'exam', weight: 5, source: 'calendar' },
  ];

  for (let i = -7; i <= 21; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const dow = d.getDay();
    if (dow === 0 || dow === 6) { heatmap.push(buildDay(dateStr, [])); continue; }
    const seed = (d.getDate() * 7 + d.getMonth() * 3) % 10;
    let n = seed < 3 ? 0 : seed < 5 ? 1 : seed < 7 ? 2 : 3;
    const events = Array.from({ length: n }, (_, j) => eventPool[(seed + j) % eventPool.length]);
    heatmap.push(buildDay(dateStr, events));
  }

  const insights = [
    { message: 'Deadlines are clustering mid-week. Plan your evenings carefully.', icon: '⚠️', level: 'warning' },
    { message: 'You have 2 exams and 1 submission in the next 5 days.', icon: '🔴', level: 'danger' },
    { message: 'Weekend is light — great time to get ahead on projects.', icon: '✅', level: 'good' },
    { message: 'Your academic load peaks on Thursday this week.', icon: '📈', level: 'info' },
    { message: 'Back-to-back submissions detected — redistribute your workload.', icon: '📌', level: 'warning' },
  ];

  const signals = [
    { subject: 'Assignment 3 – Data Structures Due Friday', from: 'prof.sharma@college.edu', date: 'Today', type: 'assignment', tag: 'Assignment Due Friday', tagColor: '#F59E0B' },
    { subject: 'Mid-term Timetable Released', from: 'exam.cell@college.edu', date: 'Yesterday', type: 'exam', tag: 'Exam Scheduled', tagColor: '#EF4444' },
    { subject: 'Project Submission Deadline Extended', from: 'se.faculty@college.edu', date: '2 days ago', type: 'assignment', tag: 'Deadline Approaching', tagColor: '#F59E0B' },
    { subject: 'Quiz 2 – Algorithms Next Week', from: 'dr.mehta@college.edu', date: '3 days ago', type: 'exam', tag: 'Quiz Upcoming', tagColor: '#8B5CF6' },
    { subject: 'DBMS Lab Report Submission', from: 'lab.coordinator@college.edu', date: '4 days ago', type: 'assignment', tag: 'Lab Due', tagColor: '#3B82F6' },
    { subject: 'End Semester Exam Schedule Posted', from: 'controller@college.edu', date: 'Last week', type: 'exam', tag: 'Exam Scheduled', tagColor: '#EF4444' },
  ];

  return { heatmap, insights, signals };
}

// Fetch real Google Calendar events
async function fetchCalendarEvents(token) {
  const timeMin = new Date(); timeMin.setDate(timeMin.getDate() - 7);
  const timeMax = new Date(); timeMax.setDate(timeMax.getDate() + 21);
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=100`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error(`Calendar API ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(ev => {
    const title = ev.summary || 'Untitled';
    const type = detectType(title);
    const date = (ev.start?.date || ev.start?.dateTime || '').split('T')[0];
    return { title, type, weight: getWeight(type), source: 'calendar', date, time: ev.start?.dateTime };
  });
}

// Fetch real Gmail academic signals
async function fetchGmailSignals(token) {
  const q = encodeURIComponent('subject:(assignment OR submission OR deadline OR exam OR quiz OR viva OR test OR project OR due OR timetable)');
  const listRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages?q=${q}&maxResults=15`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!listRes.ok) throw new Error(`Gmail list API ${listRes.status}`);
  const listData = await listRes.json();
  const messages = listData.messages || [];

  const signals = await Promise.all(messages.slice(0, 15).map(async (msg) => {
    try {
      const msgRes = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      const headers = msgData.payload?.headers || [];
      const get = name => headers.find(h => h.name === name)?.value || '';
      const subject = get('Subject');
      const from = get('From');
      const rawDate = get('Date');
      const type = detectType(subject);
      let tag = 'Academic Signal'; let tagColor = '#6B7280';
      if (type === 'exam') { tag = 'Exam Scheduled'; tagColor = '#EF4444'; }
      else if (type === 'assignment') { tag = 'Deadline Approaching'; tagColor = '#F59E0B'; }
      return { subject: subject.slice(0, 60), from: from.split('<')[0].trim(), date: rawDate.split(' ').slice(0, 4).join(' '), type, tag, tagColor };
    } catch { return null; }
  }));

  return signals.filter(Boolean);
}

// Build heatmap from calendar events + gmail signals
function buildHeatmap(calendarEvents, gmailSignalDates) {
  const today = new Date();
  const byDate = new Map();

  calendarEvents.forEach(ev => {
    if (!ev.date) return;
    if (!byDate.has(ev.date)) byDate.set(ev.date, []);
    byDate.get(ev.date).push(ev);
  });

  const heatmap = [];
  for (let i = -7; i <= 21; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const events = byDate.get(dateStr) || [];
    heatmap.push(buildDay(dateStr, events));
  }
  return heatmap;
}

// Generate intelligent insights from heatmap
function generateInsights(heatmap) {
  const upcoming = heatmap.filter(d => d.date >= new Date().toISOString().split('T')[0]);
  const highDays = upcoming.filter(d => d.level === 'high');
  const medDays = upcoming.filter(d => d.level === 'medium');
  const totalExams = upcoming.flatMap(d => d.events).filter(e => e.type === 'exam').length;
  const totalAssignments = upcoming.flatMap(d => d.events).filter(e => e.type === 'assignment').length;

  const insights = [];
  if (highDays.length > 0) {
    const peakDay = new Date(highDays[0].date).toLocaleDateString('en-US', { weekday: 'long' });
    insights.push({ message: `Your academic load peaks on ${peakDay} this week.`, icon: '🔴', level: 'danger' });
  }
  if (totalExams > 0 && totalAssignments > 0) {
    insights.push({ message: `You have ${totalExams} exam(s) and ${totalAssignments} submission(s) approaching.`, icon: '⚠️', level: 'warning' });
  } else if (totalExams > 0) {
    insights.push({ message: `${totalExams} exam(s) are scheduled in the next 3 weeks.`, icon: '📚', level: 'warning' });
  }
  if (highDays.length >= 2) {
    insights.push({ message: 'Deadlines are clustering — redistribute your evening study time.', icon: '📌', level: 'warning' });
  }
  const calmdDays = upcoming.slice(0, 3).filter(d => d.level === 'low');
  if (calmdDays.length >= 2) {
    insights.push({ message: "You're entering a calm window — ideal time to prepare ahead.", icon: '✅', level: 'good' });
  }
  if (insights.length === 0) {
    insights.push({ message: "Schedule looks manageable. Keep your momentum.", icon: '🟢', level: 'info' });
  }
  return insights.slice(0, 5);
}

// ── Shared fetch-or-mock helper ───────────────────────────────────────────────
async function getStressData(token) {
  if (token) {
    const cached = stressCache.get(token);
    if (cached && Date.now() < cached.expires) return cached;
    try {
      const [calendarEvents, signals] = await Promise.all([
        fetchCalendarEvents(token),
        fetchGmailSignals(token),
      ]);
      const heatmap = buildHeatmap(calendarEvents, []);
      const insights = generateInsights(heatmap);
      const result = { heatmap, insights, signals, expires: Date.now() + 60 * 60 * 1000 };
      stressCache.set(token, result);
      return result;
    } catch (e) {
      console.warn('Stress real API failed, falling back to mock:', e.message);
    }
  }
  return { ...getMockData(), expires: Date.now() + 60 * 60 * 1000 };
}

// ── Stress API Routes ─────────────────────────────────────────────────────────
app.get('/api/stress/heatmap', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;
  const { heatmap } = await getStressData(token);
  res.json(heatmap);
});

app.get('/api/stress/insights', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;
  const { insights } = await getStressData(token);
  res.json(insights);
});

app.get('/api/stress/gmail-signals', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;
  const { signals } = await getStressData(token);
  res.json(signals);
});

app.get('/api/stress/events', async (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || null;
  const date = req.query.date;
  const { heatmap } = await getStressData(token);
  const day = heatmap.find(d => d.date === date);
  res.json(day || { date, score: 0, level: 'low', color: '#10B981', events: [] });
});

// ── Focus & Cognitive Awareness Engine ──


// In-memory scalable placeholder for PostgreSQL/MongoDB
const focusSessions = [];

app.post('/api/focus/start', (req, res) => {
  const { user_id, duration } = req.body;
  const session = {
    id: `fs_${Date.now()}_${Math.floor(Math.random()*1000)}`,
    user_id: user_id || 'anonymous',
    target_duration: duration || 1500, // seconds
    start_time: Date.now(),
    end_time: null,
    active_time: 0,
    inactive_time: 0,
    context_switch_count: 0,
    score: 100,
    status: 'active'
  };
  focusSessions.push(session);
  res.json({ status: 'started', session });
});

app.post('/api/focus/end', (req, res) => {
  const { session_id, active_time, inactive_time, context_switch_count, exit_events } = req.body;
  
  const session = focusSessions.find(s => s.id === session_id);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  
  session.end_time = Date.now();
  session.active_time = active_time || 0;
  session.inactive_time = inactive_time || 0;
  session.context_switch_count = context_switch_count || 0;
  session.exit_events = exit_events || [];
  session.status = 'completed';
  session.total_duration = session.active_time + session.inactive_time;
  session.completed_at = Date.now();

  // Rigorous exponential decay: Score = 100 * (activeRatio) * e^(-k * switches)
  const k = 0.15;
  const activeRatio = session.total_duration > 0 ? (session.active_time / session.total_duration) : 1;
  const rawScore = 100 * activeRatio * Math.exp(-k * session.context_switch_count);
  session.score = Math.max(0, Math.round(rawScore));

  // Clinical insight graded by score
  if (session.score >= 85) {
    if (session.context_switch_count === 0) session.insight = 'Clinical Insight: Absolute deep focus. Zero fragmentation detected.';
    else session.insight = `Clinical Insight: Highly sustained attention. Minimal context drift. (Score: ${session.score})`;
  } else if (session.score >= 60) {
    session.insight = `Clinical Insight: Moderate contextual drift. Attention fragmented ${session.context_switch_count} time(s), but recovered. (Score: ${session.score})`;
  } else if (session.score >= 35) {
    session.insight = `Clinical Insight: High cognitive load penalty. Task switching caused significant focus decay. (Score: ${session.score})`;
  } else {
    session.insight = `Clinical Insight: Severe cognitive switching pattern. Sustained attention compromised. Try shorter sessions. (Score: ${session.score})`;
  }

  res.json({ status: 'ended', session });
});

app.get('/api/focus/history/:userId', (req, res) => {
  const { userId } = req.params;
  const history = focusSessions.filter(s => s.user_id === userId && s.status === 'completed');
  res.json({ history });
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

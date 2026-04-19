# 🌟 Lumina Sync

*An intelligent, highly persistent, and unified academic ecosystem built to seamlessly track, predict, and optimize a student's university life.*

Lumina is a premium React Native mobile application built to solve the disjointed experience of academic management. Instead of relying on multiple apps to track attendance, expenses, focus, deadlines, and group projects, Lumina unifies them into a single, beautiful dashboard empowered by real-time persistence and AI-driven data intelligence.

---

## 🏗️ Core Architecture & Tech Stack

The platform is dynamically separated into two heavily integrated systems working in a local-network architecture.

### 📱 Frontend: React Native & Expo
*   **Framework:** **Expo & React Native** – Chosen for rapid cross-platform deployment (iOS & Android).
*   **Navigation:** **Expo Router & React Navigation** – File-based routing driving sophisticated drill-down modals, tabs, and protected gateway routing (Auth-Guards).
*   **Styling & UI:** Pure **React Native StyleSheet** + **Reanimated** – Powers gorgeous 60fps micro-animations, glassmorphism blur effects, scaling cards, animated charting properties, and completely bespoke interactive components.
*   **Offline First:** Extensive use of `AsyncStorage` combined with custom React Contexts to serve as a fast fallback when network states change.

### ⚙️ Backend: Node.js, Express & SQLite
*   **Runtime:** **Node.js + Express** – The main proxy server binding the application together.
*   **Persistence Layer:** **SQLite 3** – Used to build a fully robust standalone `database.sqlite` backend. It actively structures, partitions, and persists:
    *   `Users` and OAuth Profiles
    *   `PersonalTasks` & `SquadTasks` (Kanban boards)
    *   `Expenses` Records
    *   `Attendance` Classes & Subject Limits
*   **Real-time Collaboration Engine:** **Socket.io** enables instantaneous peer-to-peer event emission. Manages live virtual rooms (Squads), whiteboard streams, chat payloads, hands-raising state, and live multi-player Kanban synchronization.
*   **OAuth Proxy Pipeline:** Built explicitly to bypass Expo Go's security limitations on mobile—our proxy initiates Google credential negotiations, manages time-to-live refresh tokens, and ferries data back to the mobile app via a session ID poll.
*   **Gemini NLP OCR:** Native API hook pointing towards Google Gemini for processing heavy unstructured image/PDF data into semantic JSON.

---

## ⚡ Key Modules & Features

### 1. 🔐 Centralized Auth & Unified Analytics Dashboard
*   The entire application is protected behind a **Google OAuth Gateway**. 
*   Initial boot forces unauthenticated users to a custom-designed Login portal.
*   Upon connection, the app calculates a dynamic **"Today's Overview"** panel on the Home Dash, perfectly syncing SQLite statistics for Attendance Progress, Completed Kanban Tasks, and Weekly Focus Session trends in real-time.

### 2. 👥 SyncSpace (Real-Time Squads)
*   **Create & Join specific Room IDs** to jump into live collaborative sessions via Socket.io.
*   **Live Multi-user Kanban**: Drag, drop, and edit Kanban tasks that immediately bounce across all connected clients and save into the SQLite database simultaneously.
*   Includes **Live Chat**, **Hand Raising**, and a synchronized **Interactive Whiteboard** drawing layer.

### 3. 🧠 Second Brain (Cloud RAG & OCR)
*   An intelligent **Second Brain** chatbot leveraging a high-speed Retrieval-Augmented Generation (RAG) backend pipeline.
*   Users can upload large complex course PDFs; the backend securely chunks and vectorizes documents so the AI can semantically query specific answers directly originating from their coursework material.
*   **Automated OCR Attendance**: Users upload images of their syllabus or rigid timetable structures, where Gemini AI directly parses, standardizes, and injects the schedule back into their Attendance Database.

### 4. 🌡️ The Calendar Heatmap Engine
*   A visually striking horizontal calendar widget that maps out real-world deadlines and classes to generate a heatmap stress distribution (Safe = Green, Warning = Orange, Critical = Red).
*   Allows the student to accurately predict "heavy" stress weeks directly related to upcoming assignments to prevent total burnout.

### 5. 📝 Personal Kanban & Expense Tracking
*   Seamlessly partitioned data using the verified Google Email address as a Unique ID.
*   **Kanban Module:** Full CRUD operations on categorized `Todo`, `In-Progress`, and `Done` states.
*   **Expense Tracker:** Categorized finance graphs merging local AsyncStorage caches seamlessly with `/api/expenses/sync` batch-upserts inside the SQLite database.

### 6. 🕒 Cognitive Focus & Distraction Engine
*   Tracks deep work sessions efficiently via a highly calibrated background process. 
*   **AppState Listener Integration**: The Focus Engine natively listens if the user switches apps or minimizes their screen—explicitly tracking and penalizing the session score for distractions, displaying precise "Exit Timelines."

---

## 🛠️ How to Run the Project Locally

Because of the dense backend architecture, you **must** run both the Node Server and the React Native frontend simultaneously on the same network environment.

### 1. Fire up the Backend Server
Open a terminal, navigate into the `server/` folder and boot the environment:
```bash
cd server
npm install
node index.js
```
*(This starts the SQLite database, REST APIs, OAuth tunnels, and the Socket.io WebSocket on port `3005`)*

### 2. Start the Mobile Client
Open a second terminal window, stay in the root `miti-folder/` directory and run:
```bash
npm install
npx expo start
```
*(Scan the QR code with your iOS Camera or Expo Go Android app).*

### 3. Critical Network Configuration
1. To ensure real-time Squads functionality works on your physical phone, you must change the hardcoded `10.x.x.x` IPs located in `server/index.js` and your React Native context connection files to match your exact Local Wi-Fi IPv4 Address. 
2. Because mobile Google policies block localhost Expo re-directing natively, when you hit the "Sign in with Google" button, copy the generated link and paste it into your Computer's Browser to log in. The app will detect the handshake, log you in automatically, and drop you into the Home Dashboard!

---
*Built meticulously for seamless academic efficiency and real-time collaboration.*

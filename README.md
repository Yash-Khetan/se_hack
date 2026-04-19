# 🌟 Lumina SyncSpace 

*An intelligent, highly-persistent, and unified academic ecosystem built to seamlessly track, predict, and optimize a student's university life.*

Lumina is a premium React Native mobile application built to solve the disjointed experience of academic management. Instead of relying on multiple apps to track attendance, expenses, focus, deadlines, and group projects, Lumina unifies them into a single, beautiful dashboard empowered by real-time persistence and data intelligence.

---

## 🏗️ Core Architecture & Tech Stack

The platform is dynamically separated into two heavily integrated systems working in a local-network architecture.

### 📱 Frontend: React Native & Expo
*   **Framework:** **Expo & React Native** – Chosen for rapid cross-platform deployment (iOS & Android).
*   **Navigation:** **Expo Router & React Navigation** – File-based routing driving sophisticated drill-down modals, tabs, and protected gateway routing (Auth-Guards).
*   **Styling & UI:** Pure **React Native StyleSheet** + **Reanimated** – Powers gorgeous 60fps micro-animations, glassmorphism blur effects, scaling cards, and completely bespoke interactive components.
*   **Offline First:** Extensive use of `AsyncStorage` combined with custom React Contexts to serve as a fast fallback when network states change.

### ⚙️ Backend: Node.js, Express & SQLite
*   **Runtime:** **Node.js + Express** – The main proxy server binding the application together.
*   **Persistence Layer:** **SQLite 3** – Used to build a fully robust standalone `database.sqlite` backend. It actively structures, partitions, and persists:
    *   `Users` and OAuth Profiles
    *   `PersonalTasks` & `SquadTasks` (Kanban boards)
    *   `Expenses` Records
*   **Real-time Collaboration Engine:** **Socket.io** enables instantaneous peer-to-peer event emission. Manages live virtual rooms (Squads), whiteboard streams, chat payloads, hands-raising state, and live multi-player Kanban synchronization.
*   **OAuth Proxy Pipeline:** Built explicitly to bypass Expo Go's security limitations on mobile—our proxy initiates Google credential negotiations, manages time-to-live refresh tokens, and ferries data back to the mobile app via a session ID poll.

---

## ⚡ Key Modules & Features

### 1. 🔐 Centralized Auth & Dual Dashboard Portals
*   The entire application is completely protected behind a **Google OAuth Gateway**. 
*   Initial boot forces unauthenticated users to a custom-designed Login portal.
*   Upon connection, the app unpacks the user's Google Directory Profile (Name & Email), stores it universally, and dynamically renders the **Dual Dashboard Portals**—an Email Sync widget, and an immersive Calendar Heatmap portal.

### 2. 👥 SyncSpace (Real-Time Squads)
*   **Create & Join specific Room IDs** to jump into live collaborative sessions via Socket.io.
*   **Live Multi-user Kanban**: Drag, drop, and edit Kanban tasks that immediately bounce across all connected clients and save into the SQLite database simultaneously.
*   Includes **Live Chat**, **Hand Raising**, and a synchronized **Interactive Whiteboard** drawing layer.

### 3. 🌡️ The Calendar Heatmap Engine
*   A visually striking horizontal calendar widget that parses real-world deadlines (dummy-data injected for the prototype) and classes to generate a heatmap stress distribution (Safe = Green, Warning = Orange, Critical = Red).

### 4. 📝 Personal Kanban & Expense Tracking
*   Seamlessly partitioned data using the verified Google Email address as a Unique ID.
*   **Kanban Module:** Full CRUD operations on categorized `Todo`, `In-Progress`, and `Done` states.
*   **Expense Tracker:** Categorized finance graphs merging local AsyncStorage caches seamlessly with `/api/expenses/sync` batch-upserts inside the SQLite database.

### 5. 🧠 Focus & Cognitive Analytics
*   Tracks deep work sessions efficiently. It calculates a "cognitive score" based on uninterrupted focus blocks while factoring in active-break intervals, logging the absolute efficiency of study sessions without intrusive stopwatch limitations.

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

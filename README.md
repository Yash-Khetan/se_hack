# 🌟 Lumina Student Hub (Miti App)

*An intelligent, unified academic ecosystem built to seamlessly track, predict, and optimize a student's university life.*

Lumina is a premium-grade React Native mobile application built to solve the disjointed experience of academic management. Instead of relying on multiple apps to track attendance, expenses, focus, and deadlines, Lumina unifies them into a single, beautiful dashboard empowered by AI and Emotional Intelligence.

---

## 🏗️ Core Architecture & Tech Stack

The platform is divided into two primary systems: a high-fidelity mobile frontend designed for Expo Go, and a lightweight but powerful Node.js backend to handle complex integrations securely.

### 📱 Frontend: React Native & Expo
*   **Framework:** **Expo & React Native** – Chosen for rapid cross-platform development (iOS & Android) and hot-reloading.
*   **Navigation:** **Expo Router** – File-based routing makes managing tabs and drill-down screens highly intuitive and modular.
*   **Styling & UI:** Pure **React Native StyleSheet** + **React Native Reanimated** – To deliver stunning glassmorphism, micro-animations, and 60fps interactive UI elements without sacrificing performance.
*   **Icons:** **Lucide React Native** – A clean, modern icon library that integrates seamlessly into React Native.

### ⚙️ Backend: Node.js & Express
*   **Runtime:** **Node.js + Express** – Operates on port `3005`. It serves as the proxy and computational brain of the app.
*   **Server-Side OAuth Engine:** Built explicitly to bypass Expo Go's native module limitations (e.g., `expo-crypto` crashes). The Node server generates Google verification links, handles the exact URI redirects, and performs automated background polling to seamlessly exchange access tokens to the mobile device.
*   **In-Memory Caching:** Prevents excessive API hits by caching heatmap data and Google signals to ensure the UI feels instant.

### 🧠 AI & Integrations
*   **Google Gemini API:** Utilized as the NLP engine. It parses OCR text (from timetable screenshots) to automatically build class schedules and handles heuristic academic insight generation.
*   **Google Auth, Calendar & Gmail APIs:** Allows the app to deeply integrate with the student's actual life. The app reads upcoming deadlines, exam emails, and scheduled classes to scientifically calculate real-life stress.

---

## ⚡ Key Features & Engineering Breakdown

### 1. 🌡️ The Academic Stress Engine
*   **What it does:** Replaces a static "up next" list with a psychologically intelligent Heatmap and "Stress Meter".
*   **How it works:** 
    *   The user successfully connects their Google Account (via our custom Node server bypass). 
    *   The backend pulls their Google Calendar events and Gmail inbox signals.
    *   The emails and events are scanned for academic keywords (`Assignment`, `Exam`, `Submission`, `Due`).
    *   A sophisticated algorithm assigns weights to generate a **Cognitive Stress Score (low/medium/high)**, rendering a dynamic color-coded 28-day Heatmap.

### 2. 🧠 Focus & Cognitive Analytics
*   **What it does:** Tracks deep work sessions and calculates a "cognitive score" based on uninterrupted focus and context-switching rates.
*   **How it works:** It uses React Native's `AppState` API to actively monitor when the student leaves the app. By logging exit/return events, duration, and target time, it scientifically determines how focused the student actually was, giving real-world insights rather than a simple stopwatch.

### 3. 📸 AI Timetable & Attendance System
*   **What it does:** Tracks the complex web of university attendances using a dynamic grid.
*   **How it works:** Uses the **Google Gemini API** to bridge the gap between physical schedules and data. The system extracts structured JSON classes directly from raw screen texts/screenshots, automatically populating the student's attendance buckets.

### 4. 💸 Expense & Lifestyle Tracking
*   **What it does:** A comprehensive modular tab tracking the financial footprint of a student's daily life. 
*   **How it works:** Fully client-side state management that aggregates daily spending securely using `AsyncStorage`.

### 5. 🤝 Miti / Squad Collaboration (SyncSpace)
*   **What it does:** A real-time collaboration screen designed for group projects.
*   **How it works:** Includes dynamic interactive panels, custom emoji overlays, and layout engines for peer-to-peer productivity environments.

---

## 🛠️ How to Run the Project Locally

Because of the dual-architecture approach, you must run both the Frontend and the Backend simultaneously to ensure features like Google Integration and Analytics work.

1. **Fire up the Backend:**
   Open a terminal, navigate to the `server/` folder and run:
   ```bash
   cd server
   node index.js
   ```
   *(This starts the API, OAuth flow, and Gemini endpoint on `localhost:3005`)*

2. **Start the Mobile Frontend:**
   Open a second terminal window, navigate to the `miti-folder/` root and run:
   ```bash
   npx expo start
   ```
   *(Scan the QR code with your iOS Camera or Expo Go Android app to launch Lumina).*

3. **Google OAuth Config:**
   If running on a phone, ensure both devices are on the same Wi-Fi. The backend auto-generates your dynamic IP Address URL for Google Cloud's Authorized Redirect URIs.

---
*Built meticulously for seamless academic efficiency.*

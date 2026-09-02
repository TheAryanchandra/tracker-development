# 🚀 Autonomous Engineer Growth Platform & Jarvis AI Copilot

> An intelligent, fullstack career tracking and autonomous agentic growth engine with **Live Google Sheets Bidirectional Synchronization**, **Real-Time WebSockets**, **Multimodal Vision OCR**, **Live Web Search & Scraping**, and a **Claude-Level Humanoid AI Copilot (Jarvis)**.

---

## 🌟 Overview & Architecture

This repository hosts the full software engineering growth platform designed to automate and accelerate tracking across **DSA Problem Solving (18 Categories)**, **Job Application Pipelines**, **Daily Work Streaks**, **Lecture Logs**, and **Live Global Job Discovery**.

```
                           ┌────────────────────────────────────────┐
                           │      Live Google Sheet (Cloud)         │
                           │  (Daily Logs, DSA, Apps, Lectures)     │
                           └──────────────────┬─────────────────────┘
                                              │ (1-min Cron Polling)
                                              ▼
┌────────────────────────┐      ┌─────────────────────────────┐      ┌─────────────────────────┐
│     Next.js 14 App     │ ◄──► │     Node/Express Backend    │ ◄──► │    MongoDB Atlas        │
│   (Apple Glassmorphism)│ (WS) │   (WebSocket Server on /ws) │      │  (Collections & Vector) │
└────────────────────────┘      └──────────────┬──────────────┘      └─────────────────────────┘
                                               │
                                ┌──────────────┴──────────────┐
                                │   Jarvis Agentic Engine     │
                                ├─────────────────────────────┤
                                │ • DuckDuckGo Web Search     │
                                │ • Gemini Multimodal Vision  │
                                │ • Cheerio Web Scraper       │
                                │ • TF-IDF Semantic Memory    │
                                │ • Multi-turn Persona Memory │
                                └─────────────────────────────┘
```

---

## 📊 Comprehensive STAR Method Feature Report

### 1. Live Google Sheets Auto-Sync & Real-Time Reflection
- **Situation (S)**: Engineering tracking data was updated manually in Google Sheets, causing discrepancy with the web dashboard unless manually re-uploaded.
- **Task (T)**: Automatically synchronize the live Google Sheet with the backend every minute without requiring manual CSV exports or Google Cloud API service account credentials, and immediately reflect changes across all active client dashboards.
- **Action (A)**:
  - Developed `services/googleSheetsService.js` using node-cron with a 1-minute scheduling interval (`*/1 * * * *`).
  - Utilized Google Sheets public CSV export pipeline (`/export?format=csv&gid=<GID>`) with automatic header pattern detection.
  - Built smart upsert mapping for `DailyTracker`, `ApplicationTracker`, `DsaProgress`, and `DsaLectures`.
  - Dispatched `SHEET_SYNCED` and `DATA_UPDATED` WebSocket broadcast events whenever changes are detected.
  - Implemented the `SheetSyncStatus` React component on the dashboard to display live sync timestamps, update diff counts, and provide a 1-click manual sync override.
- **Result (R)**: Any edit made to the live Google Sheet updates MongoDB and instantly triggers a smooth, non-blocking dashboard refresh across all connected client tabs in under 2 seconds.

---

### 2. High-Performance WebSocket Real-Time Event Layer
- **Situation (S)**: Standard HTTP REST polling created unnecessary network traffic, high latency, and stale dashboard metrics during active sessions.
- **Task (T)**: Establish a persistent, bi-directional communication layer to stream database mutations, Google Sheets sync notifications, and AI action triggers to the UI.
- **Action (A)**:
  - Upgraded the Express HTTP server into a dual HTTP/WebSocket server using the `ws` library on path `/ws` in `services/websocketService.js`.
  - Implemented client heartbeat pings (every 25s) with automatic reconnection.
  - Built a client-side singleton React hook (`useWebSocket` in `lib/websocket.ts`) with typed event subscriptions (`SHEET_SYNCED`, `DATA_UPDATED`, `STATS_REFRESH`, `AI_ACTION`, `JOBS_UPDATED`).
- **Result (R)**: Zero-latency real-time updates across the dashboard; when Jarvis executes an action (e.g., logging 3 DP problems), the dashboard numbers and progress rings update immediately without refreshing the page.

---

### 3. Jarvis Agentic AI Copilot (ReAct Loop & Continuous Multi-Turn Persona)
- **Situation (S)**: Standard chatbot assistants are rigid, repetitive, forget conversation context, and cannot take proactive actions or answer questions outside a fixed database.
- **Task (T)**: Build an autonomous, human-like AI companion (Jarvis) with continuous multi-turn memory, nuanced reasoning comparable to Claude 3.5 Sonnet, and tool-calling capabilities.
- **Action (A)**:
  - Engineered `ai/agentOrchestrator.js` utilizing a ReAct (Reason + Act) loop with Google Gemini function declarations (`search_web`, `scrape_url`, `query_database`, `search_jobs`, `log_daily_activity`, `log_application`, `get_memory`).
  - Implemented persistent conversation storage in MongoDB (`ConversationLog` & `LearnedFact`) paired with client-side `localStorage` caching.
  - Designed an empathetic, high-intelligence engineering mentor persona capable of seamless English and Hinglish communication.
  - Integrated Server-Sent Events (SSE) for token-by-token typewriter streaming with visual agent activity badges (`🔍 Searching web...`, `📊 Checking live database...`).
- **Result (R)**: Jarvis answers any general programming, career, or life question, remembers past user statements across sessions, and autonomously calls tools to update the database in real time.

---

### 4. Multimodal Vision OCR & Document Intelligence
- **Situation (S)**: Users frequently encounter job descriptions, offer letters, resume PDFs, or LeetCode questions as images and screenshots that cannot be pasted as plaintext.
- **Task (T)**: Enable drag-and-drop and attachment of images (PNG, JPG, WebP) and documents (PDF, DOCX, TXT) with automatic optical character recognition (OCR) and semantic chunk indexing.
- **Action (A)**:
  - Built `ai/ocrEngine.js` using Gemini Multimodal Vision API to parse images, identify document types (Offer Letter, Job Description, LeetCode problem, Resume), and extract structured entities (salary, company, role, requirements).
  - Integrated `pdf-parse` for extraction of multi-page PDF documents.
  - Implemented dynamic TF-IDF vector memory insertion via `vectorStore.addChunk()`, making uploaded files immediately queryable via RAG.
  - Built a drag-and-drop attachment UI in `AiVoiceAssistant.tsx` with live image thumbnails and processing indicators.
- **Result (R)**: Users can upload a screenshot of a LeetCode problem or a job posting and immediately ask Jarvis: *"Summarize the edge cases"* or *"Draft a tailored cover letter for this role"*.

---

### 5. Live Internet Search & Web Scraping Engine
- **Situation (S)**: LLM knowledge cutoffs and lack of browsing capabilities prevented the assistant from answering questions about current hiring trends, new library releases, or external job links.
- **Task (T)**: Equip Jarvis with live internet search and URL scraping capabilities with zero API key dependencies.
- **Action (A)**:
  - Developed `ai/webScraper.js` with DuckDuckGo HTML search scraping and Cheerio DOM parsing.
  - Built tailored extractors for LinkedIn job descriptions, Naukri postings, LeetCode problems, and GitHub repositories.
  - Implemented an in-memory 12-hour cache with automatic RAG vector indexing.
- **Result (R)**: Jarvis can be asked to *"Search the web for hiring trends at Google"* or given a URL: *"Read this job posting and tell me if my tech stack matches"*.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, TailwindCSS, Framer Motion, Lucide Icons, Recharts, React-Markdown, Remark-GFM |
| **Backend** | Node.js, Express 5, HTTP/WebSocket Server (`ws`), Node-Cron, Mongoose, Multer, Cheerio, Natural (TF-IDF NLP), PDF-Parse |
| **AI & LLM** | Google Gemini 1.5 Flash (Vision & Function Calling), ReAct Agent Orchestrator, TF-IDF Semantic Retrieval, Web Speech API (STT/TTS) |
| **Database** | MongoDB Atlas (Mongoose ODM) |
| **Live Sync** | Google Sheets CSV Streaming Engine, WebSocket Real-time Broadcasting |

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd tracker-backend
npm install
# Ensure .env contains:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# GEMINI_API_KEY=your_gemini_api_key (optional but recommended for AI)
npm start
```
*Backend starts on `http://localhost:5000` with WebSockets on `ws://localhost:5000/ws`.*

### 3. Frontend Setup
```bash
cd tracker-frontend
npm install
npm run dev
```
*Frontend will be running on `http://localhost:3000`.*

> **Note on Running Frontend:**
> - For **development with hot-reload**: Use `npm run dev`
> - For **production server**: Run `npm run build` first, then `npm start`

---

## 📡 WebSocket Event Catalog

| Event Name | Payload Data | Trigger Condition |
|---|---|---|
| `CONNECTED` | `{ message, clientCount, timestamp }` | Client establishes WS connection on `/ws` |
| `SHEET_SYNCED` | `{ totalChanges, duration, results }` | 1-minute Google Sheets cron completes |
| `DATA_UPDATED` | `{ source, changes }` | Database upsert/write operation occurs |
| `STATS_REFRESH`| `{ reason }` | Dashboard needs to recalculate metrics |
| `AI_ACTION` | `{ action, entities }` | Jarvis executes an action (e.g. `DAILY_LOG`, `DSA_UPDATED`) |
| `JOBS_UPDATED` | `{ count }` | New live jobs cached from RemoteOK/Remotive |

---

## 💬 Interacting with Jarvis AI

You can open Jarvis using the floating bot button on the bottom right:
- **Daily Logging**: *"Log today: solved 2 Graph problems and applied to Amazon."*
- **Live Web Search**: *"Search the web and find what companies are hiring junior backend engineers this week."*
- **File & Screenshot OCR**: Attach an image of a code problem or resume and ask *"Explain the time complexity of this solution"* or *"Extract key requirements from this JD."*
- **Streak & Stats**: *"What is my current DSA streak and which topics are my weakest?"*
- **URL Reading**: *"Read this link https://leetcode.com/problems/two-sum/ and explain the optimal hash map approach."*

---

## 📄 License
ISC © Aryan Chandra
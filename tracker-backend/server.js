const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get(['/', '/api', '/api/health'], (req, res) => {
  const { getClientCount } = require('./services/websocketService');
  const { getSyncStatus } = require('./services/googleSheetsService');
  const vectorStore = require('./ai/vectorStore');
  res.json({
    status: 'OK',
    message: 'Daily Tracker API is operational 🚀',
    websocketClients: getClientCount(),
    ragChunks: vectorStore.getChunkCount(),
    sheetsSync: getSyncStatus(),
  });
});

// Routes
app.use('/api/dsa-lectures',        require('./routes/dsaLectureRoutes'));
app.use('/api/daily-tracker',       require('./routes/dailyTrackerRoutes'));
app.use('/api/dsa-progress',        require('./routes/dsaProgressRoutes'));
app.use('/api/application-tracker', require('./routes/applicationTrackerRoutes'));
app.use('/api/upload',              require('./routes/uploadRoutes'));
app.use('/api/dashboard',           require('./routes/dashboardRoutes'));
app.use('/api/ai',                  require('./routes/aiRoutes'));
app.use('/api/notifications',       require('./routes/notificationRoutes'));
app.use('/api/sheets',              require('./routes/sheetsRoutes'));
app.use('/api/tasks',               require('./routes/taskRoutes'));
app.use('/api/contact',             require('./routes/contactRoutes'));
app.get('/api/automations/status', (req, res) => {
  const { status } = require('./services/automationService');
  res.json({ success: true, automation: status() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── Create HTTP server (needed for WebSocket upgrade) ─────────
const server = http.createServer(app);

// ── Initialize WebSocket server ───────────────────────────────
const { initWebSocket } = require('./services/websocketService');

// ── Seed default DSA Topics ───────────────────────────────────
const DsaProgress = require('./models/DsaProgress');
const seedDefaultDsaTopics = async () => {
  try {
    const count = await DsaProgress.countDocuments();
    if (count === 0) {
      const topics = [
        'Basics (Time/Space Complexity, Math)', 'Sorting Algorithms', 'Arrays', 'Binary Search',
        'Strings', 'Linked List', 'Recursion & Backtracking', 'Bit Manipulation',
        'Stack & Queue', 'Sliding Window & Two Pointer', 'Heaps', 'Greedy Algorithms',
        'Binary Trees', 'Binary Search Trees', 'Graphs', 'Dynamic Programming', 'Tries', 'Advanced Strings',
      ];
      await DsaProgress.insertMany(topics.map(topic => ({ topic, totalProblems: 0, problemsSolved: 0, percentComplete: 0, status: 'Not Started' })));
      console.log('[Seed] Seeded 18 DSA topics');
    }
  } catch (err) { console.error('[Seed Error]:', err.message); }
};

// ── Notification Scheduler ────────────────────────────────────
const { runAllChecks } = require('./services/notificationService');
const scheduleNotifications = () => {
  setTimeout(async () => { await runAllChecks(); }, 30000);
  setInterval(async () => { await runAllChecks(); }, 6 * 60 * 60 * 1000);
};

// ── Google Sheets Cron ────────────────────────────────────────
const { startSheetsCron } = require('./services/googleSheetsService');

const PORT = process.env.PORT || 5000;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Server] Port ${PORT} is already in use. The existing Aryan Tracker backend is likely already running.`);
    console.error(`[Server] Stop the process using port ${PORT}, then run npm start again.`);
    return;
  }
  console.error('[Server] Unable to start:', err.message);
});
server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT}`);
  console.log(`[Server] WebSocket available at ws://localhost:${PORT}/ws`);
  initWebSocket(server);
  seedDefaultDsaTopics();
  scheduleNotifications();
  startSheetsCron();
});

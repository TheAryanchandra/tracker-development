const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const path = require('path');

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({ status: 'OK', message: 'Daily Tracker API is operational 🚀' });
});

// Routes
app.use('/api/dsa-lectures',       require('./routes/dsaLectureRoutes'));
app.use('/api/daily-tracker',      require('./routes/dailyTrackerRoutes'));
app.use('/api/dsa-progress',       require('./routes/dsaProgressRoutes'));
app.use('/api/application-tracker',require('./routes/applicationTrackerRoutes'));
app.use('/api/upload',             require('./routes/uploadRoutes'));
app.use('/api/dashboard',          require('./routes/dashboardRoutes'));
app.use('/api/ai',                 require('./routes/aiRoutes'));
app.use('/api/notifications',      require('./routes/notificationRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// ── Seed default DSA Topics ──────────────────────────────────
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

// ── Notification Scheduler ───────────────────────────────────
const { runAllChecks } = require('./services/notificationService');
const scheduleNotifications = () => {
  // Run once 30s after startup (give DB time to connect)
  setTimeout(async () => {
    await runAllChecks();
  }, 30000);

  // Then every 6 hours
  setInterval(async () => {
    await runAllChecks();
  }, 6 * 60 * 60 * 1000);
};

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Server] Running on port ${PORT}`);
  seedDefaultDsaTopics();
  scheduleNotifications();
});

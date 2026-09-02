const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Models for seed check
const DsaProgress = require('./models/DsaProgress');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Default API healthcheck route
app.get(['/', '/api', '/api/health'], (req, res) => {
  res.json({ status: 'OK', message: 'Daily Tracker API is operational 🚀' });
});

// Mount Routes
app.use('/api/dsa-lectures', require('./routes/dsaLectureRoutes'));
app.use('/api/daily-tracker', require('./routes/dailyTrackerRoutes'));
app.use('/api/dsa-progress', require('./routes/dsaProgressRoutes'));
app.use('/api/application-tracker', require('./routes/applicationTrackerRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

// Seed default DSA Topics if empty
const seedDefaultDsaTopics = async () => {
  try {
    const count = await DsaProgress.countDocuments();
    if (count === 0) {
      const defaultTopics = [
        'Basics (Time/Space Complexity, Math)',
        'Sorting Algorithms',
        'Arrays',
        'Binary Search',
        'Strings',
        'Linked List',
        'Recursion & Backtracking',
        'Bit Manipulation',
        'Stack & Queue',
        'Sliding Window & Two Pointer',
        'Heaps',
        'Greedy Algorithms',
        'Binary Trees',
        'Binary Search Trees',
        'Graphs',
        'Dynamic Programming',
        'Tries',
        'Advanced Strings',
      ];

      const seedData = defaultTopics.map(topic => ({
        topic,
        totalProblems: 0,
        problemsSolved: 0,
        percentComplete: 0,
        status: 'Add problem count',
      }));

      await DsaProgress.insertMany(seedData);
      console.log('[Seed]: Seeded 18 standard DSA topics into MongoDB');
    }
  } catch (err) {
    console.error('[Seed Error]:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Express Server]: Running on port ${PORT}`);
  seedDefaultDsaTopics();
});


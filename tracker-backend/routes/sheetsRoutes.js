/**
 * Google Sheets Routes
 * POST /api/sheets/sync   — Manual trigger sync from frontend
 * GET  /api/sheets/status — Last sync time, row counts, status
 */

const express = require('express');
const router = express.Router();
const { syncGoogleSheet, getSyncStatus } = require('../services/googleSheetsService');

// GET /api/sheets/status
router.get('/status', (req, res) => {
  const status = getSyncStatus();
  res.json({ success: true, data: status });
});

// POST /api/sheets/sync — manual trigger
router.post('/sync', async (req, res) => {
  try {
    const result = await syncGoogleSheet();
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

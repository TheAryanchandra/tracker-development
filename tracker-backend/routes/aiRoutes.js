const express = require('express');
const router = express.Router();
const { handleAiChat, handleAiStream } = require('../controllers/aiController');

// POST /api/ai/chat — standard JSON response
router.post('/chat', handleAiChat);

// GET /api/ai/stream?prompt=...&sessionId=... — SSE streaming response
router.get('/stream', handleAiStream);

module.exports = router;

const express = require('express');
const router = express.Router();
const { handleAiChat, handleAiStream, handleFileUpload } = require('../controllers/aiController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Disk storage for AI file uploads (images, PDFs, docs)
const aiUploadsDir = path.join(__dirname, '../uploads/ai-files');
if (!fs.existsSync(aiUploadsDir)) {
  fs.mkdirSync(aiUploadsDir, { recursive: true });
}

const aiFileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, aiUploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = file.originalname.replace(ext, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

const uploadAiFile = multer({
  storage: aiFileStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.txt', '.md', '.csv',
                     '.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error(`File type ${ext} not supported. Allowed: ${allowed.join(', ')}`), false);
  },
});

// POST /api/ai/chat — standard JSON response
router.post('/chat', handleAiChat);

// GET /api/ai/stream?prompt=...&sessionId=... — SSE streaming response
router.get('/stream', handleAiStream);

// POST /api/ai/upload — upload file (image/PDF/doc) for OCR + RAG injection
router.post('/upload', uploadAiFile.single('file'), handleFileUpload);

module.exports = router;

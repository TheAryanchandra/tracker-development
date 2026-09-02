const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadExcel } = require('../controllers/uploadController');

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.includes('excel') ||
      file.mimetype.includes('spreadsheetml') ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls') ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx, .xls) and CSV files are allowed!'), false);
    }
  },
});

router.post('/excel', upload.single('file'), uploadExcel);

module.exports = router;

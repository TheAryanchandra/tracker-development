const express = require('express');
const { handleLogin, handleMe, handleUpdateCredentials } = require('../controllers/authController');
const { authenticate, requireRole } = require('../services/authService');

const router = express.Router();
router.post('/login', handleLogin);
router.get('/me', authenticate, handleMe);
router.put('/credentials', authenticate, requireRole('admin'), handleUpdateCredentials);

module.exports = router;
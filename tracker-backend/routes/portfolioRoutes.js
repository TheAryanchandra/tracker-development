/**
 * Portfolio Express Routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const { authenticate } = require('../services/authService');

// Public endpoints (no JWT required)
router.get('/', portfolioController.getPortfolio);
router.post('/contact', portfolioController.submitContact);

// Protected endpoints (JWT authentication required for admin panel actions)
router.put('/', authenticate, portfolioController.updatePortfolio);
router.get('/contacts', authenticate, portfolioController.getContacts);
router.delete('/contacts/:id', authenticate, portfolioController.deleteContact);

module.exports = router;


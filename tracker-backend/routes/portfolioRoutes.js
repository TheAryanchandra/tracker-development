/**
 * Portfolio Express Routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/', portfolioController.getPortfolio);
router.put('/', portfolioController.updatePortfolio);
router.post('/contact', portfolioController.submitContact);
router.get('/contacts', portfolioController.getContacts);
router.delete('/contacts/:id', portfolioController.deleteContact);

module.exports = router;


const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { broadcast } = require('../services/websocketService');

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    
    const newContact = await Contact.create({ name, email, message });
    
    // Notify via WebSocket so dashboard can update if needed
    broadcast('CONTACT_RECEIVED', { name, email });
    
    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error('[Contact API Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

// GET /api/contact
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('[Contact API Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

module.exports = router;

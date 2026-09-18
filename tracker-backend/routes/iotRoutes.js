/**
 * IoT Express Routes
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

router.get('/devices', iotController.getAllDevices);
router.post('/devices', iotController.createDevice);
router.post('/control', iotController.controlDevice);
router.delete('/devices/:id', iotController.deleteDevice);

module.exports = router;

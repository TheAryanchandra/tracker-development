const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationController');

router.get('/', ctrl.getNotifications);
router.get('/unread-count', ctrl.getUnreadCount);
router.get('/stream', ctrl.streamNotifications);
router.get('/jobs', ctrl.getJobs);
router.put('/read-all', ctrl.markAllRead);
router.put('/:id/read', ctrl.markOneRead);
router.delete('/', ctrl.clearAll);
router.post('/trigger', ctrl.triggerChecks);

module.exports = router;

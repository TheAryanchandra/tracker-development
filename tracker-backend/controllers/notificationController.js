const Notification = require('../models/Notification');
const { runAllChecks, checkNewJobs } = require('../services/notificationService');
const { searchJobs, formatJobsForResponse } = require('../ai/jobSearcher');

// GET /api/notifications — list all notifications
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    const unreadCount = await Notification.countDocuments({ read: false });
    res.json({ success: true, data: notifications, unreadCount });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/notifications/read-all — mark all as read
exports.markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// PUT /api/notifications/:id/read — mark one as read
exports.markOneRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// DELETE /api/notifications — clear all
exports.clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({});
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/notifications/unread-count — lightweight count for badge
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    res.json({ success: true, count });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// POST /api/notifications/trigger — manual trigger for checks
exports.triggerChecks = async (req, res) => {
  try {
    await runAllChecks();
    res.json({ success: true, message: 'Notification checks triggered' });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// GET /api/notifications/jobs — paginated job listings with multi-source filtering
exports.getJobs = async (req, res) => {
  try {
    const { searchJobsPaginated } = require('../ai/jobSearcher');
    const query = req.query.q || req.query.search || '';
    const source = req.query.source || '';
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const forceRefresh = req.query.refresh === 'true';

    const result = await searchJobsPaginated({
      query,
      source,
      page,
      limit,
      forceRefresh,
    });

    res.json({
      success: true,
      data: result.jobs,
      pagination: result.pagination,
      sources: result.sources,
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

// SSE — GET /api/notifications/stream — real-time notification push
exports.streamNotifications = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // Send initial unread count
  const count = await Notification.countDocuments({ read: false });
  send({ type: 'init', unreadCount: count });

  // Poll for new notifications every 30 seconds
  const interval = setInterval(async () => {
    try {
      const c = await Notification.countDocuments({ read: false });
      const latest = await Notification.findOne({ read: false }).sort({ createdAt: -1 }).lean();
      send({ type: 'update', unreadCount: c, latest });
    } catch (e) { /* ignore */ }
  }, 30000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
};

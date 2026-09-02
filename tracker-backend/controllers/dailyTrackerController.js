const DailyTracker = require('../models/DailyTracker');

// Get daily tracker logs
exports.getDailyLogs = async (req, res) => {
  try {
    const logs = await DailyTracker.find().sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create daily log
exports.createDailyLog = async (req, res) => {
  try {
    const log = await DailyTracker.create(req.body);
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update daily log
exports.updateDailyLog = async (req, res) => {
  try {
    const log = await DailyTracker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete daily log
exports.deleteDailyLog = async (req, res) => {
  try {
    const log = await DailyTracker.findByIdAndDelete(req.params.id);
    if (!log) return res.status(404).json({ success: false, message: 'Log not found' });
    res.json({ success: true, message: 'Daily log deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

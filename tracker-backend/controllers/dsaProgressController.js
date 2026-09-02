const DsaProgress = require('../models/DsaProgress');

// Get all topic progress
exports.getProgressList = async (req, res) => {
  try {
    const list = await DsaProgress.find().sort({ createdAt: 1 });
    res.json({ success: true, count: list.length, data: list });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a topic progress record
exports.createProgress = async (req, res) => {
  try {
    const progress = new DsaProgress(req.body);
    await progress.save();
    res.status(201).json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a topic progress record
exports.updateProgress = async (req, res) => {
  try {
    let progress = await DsaProgress.findById(req.params.id);
    if (!progress) return res.status(404).json({ success: false, message: 'Topic progress not found' });
    
    Object.assign(progress, req.body);
    await progress.save(); // triggers pre-save hook for percent calculation
    
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete topic progress
exports.deleteProgress = async (req, res) => {
  try {
    const progress = await DsaProgress.findByIdAndDelete(req.params.id);
    if (!progress) return res.status(404).json({ success: false, message: 'Progress record not found' });
    res.json({ success: true, message: 'Progress record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

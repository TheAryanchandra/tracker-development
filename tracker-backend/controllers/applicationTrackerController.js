const ApplicationTracker = require('../models/ApplicationTracker');

// Get all applications
exports.getApplications = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const apps = await ApplicationTracker.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: apps.length, data: apps });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create an application
exports.createApplication = async (req, res) => {
  try {
    const app = await ApplicationTracker.create(req.body);
    res.status(201).json({ success: true, data: app });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update an application
exports.updateApplication = async (req, res) => {
  try {
    const app = await ApplicationTracker.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete an application
exports.deleteApplication = async (req, res) => {
  try {
    const app = await ApplicationTracker.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

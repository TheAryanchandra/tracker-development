const DsaLecture = require('../models/DsaLecture');

// Get all lectures
exports.getLectures = async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status) query.status = status;
    if (search) query.title = { $regex: search, $options: 'i' };

    const lectures = await DsaLecture.find(query).sort({ srNo: 1 });
    res.json({ success: true, count: lectures.length, data: lectures });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create a lecture
exports.createLecture = async (req, res) => {
  try {
    const { srNo, url, title, duration, status } = req.body;
    const lecture = await DsaLecture.create({ srNo, url, title, duration, status });
    res.status(201).json({ success: true, data: lecture });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update a lecture
exports.updateLecture = async (req, res) => {
  try {
    const lecture = await DsaLecture.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });
    res.json({ success: true, data: lecture });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Delete a lecture
exports.deleteLecture = async (req, res) => {
  try {
    const lecture = await DsaLecture.findByIdAndDelete(req.params.id);
    if (!lecture) return res.status(404).json({ success: false, message: 'Lecture not found' });
    res.json({ success: true, message: 'Lecture deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

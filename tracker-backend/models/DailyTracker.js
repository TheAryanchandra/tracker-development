const mongoose = require('mongoose');

const DailyTrackerSchema = new mongoose.Schema(
  {
    date: { type: String, required: true }, // e.g. '01-Sep-2026' or '2026-09-01'
    dsaDone: { type: Boolean, default: false },
    dsaTopic: { type: String, default: '' },
    applicationsSent: { type: Number, default: 0 },
    projectWork: { type: Boolean, default: false },
    project: { type: String, default: '' },
    aiLearning: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DailyTracker', DailyTrackerSchema);

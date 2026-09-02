const mongoose = require('mongoose');

const ApplicationTrackerSchema = new mongoose.Schema(
  {
    srNo: { type: Number },
    dateApplied: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    platform: { type: String, default: 'LinkedIn' },
    status: {
      type: String,
      enum: ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Follow-up Pending'],
      default: 'Applied',
    },
    followUpDate: { type: String, default: '' },
    notes: { type: String, default: '' },
    resumeUrl: { type: String, default: '' },
    attachmentName: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ApplicationTracker', ApplicationTrackerSchema);

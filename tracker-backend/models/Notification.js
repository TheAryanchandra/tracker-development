const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['job_alert', 'streak_warning', 'dsa_reminder', 'application_update', 'system'],
    default: 'system',
  },
  title:   { type: String, required: true },
  body:    { type: String, required: true },
  icon:    { type: String, default: '🔔' },
  url:     { type: String }, // deep-link to relevant page
  read:    { type: Boolean, default: false },
  data:    { type: mongoose.Schema.Types.Mixed }, // extra payload
  createdAt: { type: Date, default: Date.now },
});

// Auto-delete notifications after 7 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7 * 24 * 3600 });
notificationSchema.index({ read: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);

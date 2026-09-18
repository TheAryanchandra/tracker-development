const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: 'Aryan' },
  role: { type: String, enum: ['admin', 'member'], default: 'admin' },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
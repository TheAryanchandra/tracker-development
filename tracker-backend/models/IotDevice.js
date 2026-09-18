/**
 * IoT Device Schema
 * ─────────────────────────────────────────────────────────────────────────────
 * Represents smart IoT devices, status, switch states, telemetry, and rules.
 */

const mongoose = require('mongoose');

const IotDeviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ['light', 'switch', 'sensor', 'thermostat', 'camera', 'relay', 'smart_plug'],
    default: 'switch',
  },
  location: {
    type: String,
    default: 'Studio Desk',
  },
  state: {
    isOn: { type: Boolean, default: false },
    value: { type: Number, default: 0 },
    color: { type: String, default: '#3b82f6' },
    statusText: { type: String, default: 'Offline' },
  },
  telemetry: {
    temperature: { type: Number, default: 24.5 },
    humidity: { type: Number, default: 55 },
    powerWatts: { type: Number, default: 12 },
    lastUpdated: { type: Date, default: Date.now },
  },
  isOnline: {
    type: Boolean,
    default: true,
  },
  automationRules: [
    {
      ruleName: String,
      triggerCondition: String,
      action: String,
      enabled: { type: Boolean, default: true },
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('IotDevice', IotDeviceSchema);

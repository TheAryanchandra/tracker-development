/**
 * IoT Controller — Managing Smart IoT Devices & Telemetry
 * ─────────────────────────────────────────────────────────────────────────────
 */

const IotDevice = require('../models/IotDevice');
const { broadcast, WS_EVENTS } = require('../services/websocketService');

// Initial seed devices if database is empty
const seedDefaultIotDevices = async () => {
  try {
    const count = await IotDevice.countDocuments();
    if (count === 0) {
      const defaultDevices = [
        {
          deviceId: 'dev_desk_light',
          name: 'Studio Desk Light',
          category: 'light',
          location: 'Studio Desk',
          state: { isOn: true, value: 85, color: '#6366f1', statusText: 'Active 85% Brightness' },
          telemetry: { temperature: 24.2, humidity: 52, powerWatts: 14.5, lastUpdated: new Date() },
          isOnline: true,
        },
        {
          deviceId: 'dev_smart_thermostat',
          name: 'AI Climate Thermostat',
          category: 'thermostat',
          location: 'Main Workspace',
          state: { isOn: true, value: 22, color: '#10b981', statusText: 'Target: 22°C' },
          telemetry: { temperature: 22.0, humidity: 48, powerWatts: 120, lastUpdated: new Date() },
          isOnline: true,
        },
        {
          deviceId: 'dev_server_relay',
          name: 'GPU Dev Server Relay',
          category: 'relay',
          location: 'Rack Server',
          state: { isOn: true, value: 100, color: '#f59e0b', statusText: 'Online (230V Active)' },
          telemetry: { temperature: 38.5, humidity: 40, powerWatts: 280, lastUpdated: new Date() },
          isOnline: true,
        },
        {
          deviceId: 'dev_ambient_sensor',
          name: 'Workspace Environmental Sensor',
          category: 'sensor',
          location: 'Office Shelf',
          state: { isOn: true, value: 1, color: '#06b6d4', statusText: 'Monitoring Active' },
          telemetry: { temperature: 25.1, humidity: 56, powerWatts: 2.1, lastUpdated: new Date() },
          isOnline: true,
        },
      ];
      await IotDevice.insertMany(defaultDevices);
      console.log('[IoT Seed] Seeded 4 default smart IoT devices');
    }
  } catch (err) {
    console.error('[IoT Seed Error]:', err.message);
  }
};

/**
 * GET /api/iot/devices
 */
exports.getAllDevices = async (req, res) => {
  try {
    await seedDefaultIotDevices();
    const devices = await IotDevice.find().sort({ createdAt: -1 });
    res.json({ success: true, count: devices.length, devices });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/iot/devices (Add new device)
 */
exports.createDevice = async (req, res) => {
  try {
    const { deviceId, name, category, location } = req.body;
    const device = await IotDevice.create({
      deviceId: deviceId || `dev_${Date.now()}`,
      name: name || 'New Smart Device',
      category: category || 'switch',
      location: location || 'Studio',
      state: { isOn: false, value: 0, statusText: 'Ready' },
      isOnline: true,
    });
    broadcast('IOT_STATUS_CHANGED', { device });
    res.status(201).json({ success: true, device });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/**
 * POST /api/iot/control (Control or toggle device state)
 */
exports.controlDevice = async (req, res) => {
  try {
    const { deviceId, isOn, value, color, statusText } = req.body;
    const device = await IotDevice.findOne({ deviceId });
    if (!device) {
      return res.status(404).json({ success: false, message: `IoT Device "${deviceId}" not found` });
    }

    if (typeof isOn === 'boolean') device.state.isOn = isOn;
    if (typeof value === 'number') device.state.value = value;
    if (color) device.state.color = color;
    if (statusText) device.state.statusText = statusText;
    else device.state.statusText = device.state.isOn ? `Active (${device.state.value || 100}%)` : 'Powered Off';

    device.telemetry.lastUpdated = new Date();
    await device.save();

    broadcast('IOT_STATUS_CHANGED', { device });
    res.json({ success: true, message: `Device ${device.name} updated`, device });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/iot/devices/:id
 */
exports.deleteDevice = async (req, res) => {
  try {
    await IotDevice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Device removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

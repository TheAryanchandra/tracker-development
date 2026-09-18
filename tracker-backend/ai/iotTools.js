/**
 * IoT Tool Bindings for Jarvis Agent ToolRegistry
 * ─────────────────────────────────────────────────────────────────────────────
 */

const toolRegistry = require('./ToolRegistry');
const IotDevice = require('../models/IotDevice');
const { broadcast } = require('../services/websocketService');

function registerIotTools() {
  toolRegistry.register({
    name: 'get_iot_status',
    description: 'Query status, power, temperature, and switch state of connected smart IoT devices in Aryan\'s studio/workspace.',
    category: 'iot',
    isMutating: false,
    timeoutMs: 5000,
    parameters: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Optional specific device ID to filter by' },
      },
    },
    handler: async (args) => {
      try {
        const query = args.deviceId ? { deviceId: args.deviceId } : {};
        const devices = await IotDevice.find(query);
        if (!devices.length) return 'No IoT devices found.';

        return devices.map(d =>
          `[${d.name} (${d.deviceId})]: Status: ${d.state.isOn ? 'ON' : 'OFF'} (${d.state.statusText}) | Temp: ${d.telemetry.temperature}°C | Humidity: ${d.telemetry.humidity}% | Power: ${d.telemetry.powerWatts}W`
        ).join('\n');
      } catch (err) {
        return `Failed to fetch IoT status: ${err.message}`;
      }
    },
  });

  toolRegistry.register({
    name: 'control_iot_device',
    description: 'Turn ON/OFF or adjust state/brightness/temperature of a smart IoT device.',
    category: 'iot',
    isMutating: true,
    timeoutMs: 5000,
    parameters: {
      type: 'object',
      properties: {
        deviceId: { type: 'string', description: 'Target device ID (e.g. dev_desk_light, dev_smart_thermostat, dev_server_relay)' },
        isOn: { type: 'boolean', description: 'Power state: true for ON, false for OFF' },
        value: { type: 'number', description: 'Value (brightness percentage or target temp °C)' },
      },
      required: ['deviceId', 'isOn'],
    },
    handler: async (args) => {
      try {
        let device = await IotDevice.findOne({ deviceId: args.deviceId });
        if (!device) {
          // Try loose match by name
          device = await IotDevice.findOne({ name: { $regex: args.deviceId, $options: 'i' } });
        }
        if (!device) {
          return `IoT device matching "${args.deviceId}" was not found.`;
        }

        device.state.isOn = Boolean(args.isOn);
        if (typeof args.value === 'number') device.state.value = args.value;
        device.state.statusText = device.state.isOn ? `Active (${device.state.value || 100}%)` : 'Powered Off';
        device.telemetry.lastUpdated = new Date();
        await device.save();

        broadcast('IOT_STATUS_CHANGED', { device });
        return `Successfully updated IoT device "${device.name}" state to ${device.state.isOn ? 'ON' : 'OFF'} (${device.state.statusText}).`;
      } catch (err) {
        return `Failed to control IoT device: ${err.message}`;
      }
    },
  });

  console.log('[IotTools] Registered IoT tools into ToolRegistry');
}

module.exports = { registerIotTools };

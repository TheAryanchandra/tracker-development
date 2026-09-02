const Task = require('../models/Task');
const { broadcast, WS_EVENTS } = require('../services/websocketService');

function publish(action, task) {
  broadcast(WS_EVENTS.TASK_UPDATED, { action, task });
  broadcast(WS_EVENTS.STATS_REFRESH, { reason: 'task_updated' });
}

exports.listTasks = async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const tasks = await Task.find(filter).sort({ status: 1, dueAt: 1, createdAt: -1 }).limit(100).lean();
    res.json({ success: true, tasks });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

exports.createTask = async (req, res) => {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ success: false, message: 'Task title is required' });
    const task = await Task.create({ ...req.body, title: req.body.title.trim(), source: req.body.source || 'dashboard' });
    publish('created', task);
    res.status(201).json({ success: true, task });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    publish('updated', task);
    res.json({ success: true, task });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    publish('deleted', task);
    res.json({ success: true });
  } catch (error) { res.status(400).json({ success: false, message: error.message }); }
};

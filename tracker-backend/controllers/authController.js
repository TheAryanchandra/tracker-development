const { login, updateCredentials } = require('../services/authService');

exports.handleLogin = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });
  try {
    const result = await login(email.trim().toLowerCase(), password);
    if (!result) return res.status(401).json({ success: false, message: 'Invalid email or password' });
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(503).json({ success: false, message: error.message });
  }
};

exports.handleMe = (req, res) => res.json({ success: true, user: req.user });

exports.handleUpdateCredentials = async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const result = await updateCredentials(req.user.email, email?.trim().toLowerCase(), password);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};
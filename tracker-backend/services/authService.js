const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const AdminUser = require('../models/AdminUser');

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 32) throw new Error('AUTH_SECRET must be at least 32 characters');
  return value;
}

function createToken(user) {
  return jwt.sign({
    sub: user.email,
    email: user.email,
    name: user.name || 'Aryan',
    role: user.role || 'member',
  }, secret(), { expiresIn: '7d', issuer: 'aryan-tracker' });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, secret(), { issuer: 'aryan-tracker' });
  } catch {
    return null;
  }
}

function authenticate(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : req.query.access_token;
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ success: false, message: 'Authentication required' });
  req.user = user;
  return next();
}

async function login(email, password) {
  const expectedEmail = process.env.AUTH_EMAIL;
  const expectedPassword = process.env.AUTH_PASSWORD;
  if (!expectedEmail || !expectedPassword) throw new Error('AUTH_EMAIL and AUTH_PASSWORD are not configured');
  let storedUser = null;
  if (mongoose.connection.readyState === 1) storedUser = await AdminUser.findOne({}).lean();
  if (storedUser) {
    if (email !== storedUser.email || !(await bcrypt.compare(password, storedUser.passwordHash))) return null;
  } else if (email !== expectedEmail.toLowerCase() || password !== expectedPassword) {
    return null;
  } else if (mongoose.connection.readyState === 1) {
    storedUser = await AdminUser.create({
      email,
      passwordHash: await bcrypt.hash(password, 12),
      name: process.env.AUTH_NAME || 'Aryan',
      role: process.env.AUTH_ROLE || 'admin',
    });
  }
  const user = {
    email: storedUser?.email || email,
    name: storedUser?.name || process.env.AUTH_NAME || 'Aryan',
    role: storedUser?.role || process.env.AUTH_ROLE || 'admin',
  };
  return { token: createToken(user), user };
}

async function updateCredentials(currentEmail, nextEmail, nextPassword) {
  if (!nextEmail || !nextPassword || nextPassword.length < 10) {
    throw new Error('Email and a password with at least 10 characters are required');
  }
  if (mongoose.connection.readyState !== 1) throw new Error('Database is not connected');
  const user = await AdminUser.findOne({ email: currentEmail });
  if (!user) throw new Error('Admin account was not initialized');
  user.email = nextEmail.trim().toLowerCase();
  user.passwordHash = await bcrypt.hash(nextPassword, 12);
  user.updatedAt = new Date();
  await user.save();
  const safeUser = { email: user.email, name: user.name, role: user.role };
  return { token: createToken(safeUser), user: safeUser };
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient permissions' });
    }
    return next();
  };
}

module.exports = { authenticate, login, updateCredentials, verifyToken, requireRole };
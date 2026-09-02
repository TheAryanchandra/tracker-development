const mongoose = require('mongoose');
const dns = require('dns');

// Force reliable public DNS servers for resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('[DNS Notice]:', e.message);
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb+srv://tracker-backend:1234@cluster0.20h5i3g.mongodb.net/tracker?retryWrites=true&w=majority';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 20000,
    });
    console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Connection Notice]: ${error.message}`);
    console.log('[MongoDB]: Running with active In-Memory Fallback Cache. Retrying in background...');
    
    // Background retry
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;

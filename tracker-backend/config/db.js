const mongoose = require('mongoose');
const dns = require('dns');

// Force Google/Cloudflare public DNS servers for resolving MongoDB Atlas SRV records on Windows
try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch (e) {
  console.warn('[DNS Config Notice]:', e.message);
}

if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`[MongoDB Connected Successfully]: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`[MongoDB Connection Warning]: ${error.message}`);
    console.warn('[MongoDB Notice]: Continuing in fallback mode. Will retry connection on requests.');
  }
};

module.exports = connectDB;

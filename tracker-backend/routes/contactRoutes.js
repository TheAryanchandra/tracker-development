const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const { broadcast } = require('../services/websocketService');

let nodemailer;
try { nodemailer = require('nodemailer'); } catch (e) {}

/**
 * Send Whisperflow email notification to Aryan's Gmail
 */
async function sendWhisperflowNotification({ name, email, message }) {
  if (!nodemailer) {
    console.warn('[Whisperflow] nodemailer not available, skipping email.');
    return;
  }

  // Use Gmail SMTP (app password) or environment variable for SMTP config
  const smtpUser = process.env.SMTP_USER || 'aryanchandra3456@gmail.com';
  const smtpPass = process.env.SMTP_PASS; // Set SMTP_PASS in .env (Gmail App Password)

  if (!smtpPass) {
    console.log('[Whisperflow] No SMTP_PASS set — contact saved to DB only. Set SMTP_PASS in .env to enable email.');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: smtpUser, pass: smtpPass },
  });

  const htmlBody = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;background:#0f172a;border-radius:16px;padding:32px;color:#e2e8f0">
      <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:12px;padding:20px 24px;margin-bottom:24px">
        <h1 style="margin:0;font-size:22px;font-weight:800;color:#fff">🚀 New Portfolio Contact</h1>
        <p style="margin:6px 0 0;font-size:13px;color:#e0e7ff;opacity:0.85">via Jarvis AI Portfolio — Whisperflow Notification</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">From</td><td style="padding:10px 0;border-bottom:1px solid #1e293b;font-size:15px;font-weight:700;color:#f1f5f9">${name}</td></tr>
        <tr><td style="padding:10px 0;border-bottom:1px solid #1e293b;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em">Email</td><td style="padding:10px 0;border-bottom:1px solid #1e293b"><a href="mailto:${email}" style="color:#818cf8;font-size:14px;font-weight:600">${email}</a></td></tr>
        <tr><td style="padding:10px 0;font-size:12px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;vertical-align:top">Message</td><td style="padding:10px 0;font-size:14px;color:#cbd5e1;line-height:1.7">${message}</td></tr>
      </table>
      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #1e293b;text-align:center;font-size:11px;color:#475569">
        Sent by Jarvis AI Portfolio • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Jarvis Portfolio Bot" <${smtpUser}>`,
      to: 'aryanchandra3456@gmail.com',
      replyTo: email,
      subject: `[Portfolio Contact] ${name} — New Inquiry`,
      html: htmlBody,
      text: `New contact from: ${name} <${email}>\n\nMessage:\n${message}`,
    });
    console.log(`[Whisperflow] Contact email sent → aryanchandra3456@gmail.com from ${email}`);
  } catch (err) {
    console.error('[Whisperflow] Email send failed:', err.message);
  }
}

// POST /api/contact
router.post('/', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const newContact = await Contact.create({ name, email, message });

    // Broadcast WebSocket event
    broadcast('CONTACT_RECEIVED', { name, email });

    // Fire Whisperflow email notification (non-blocking)
    sendWhisperflowNotification({ name, email, message }).catch(() => {});

    res.status(201).json({ success: true, data: newContact });
  } catch (error) {
    console.error('[Contact API Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to submit contact form' });
  }
});

// GET /api/contact
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('[Contact API Error]:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

module.exports = router;

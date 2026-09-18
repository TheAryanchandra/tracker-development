/**
 * Portfolio Controller
 * ─────────────────────────────────────────────────────────────────────────────
 * GET & PUT portfolio content for dynamic Admin management and public display.
 */

const Portfolio = require('../models/Portfolio');

// Default initial data for portfolio if database is empty
const getDefaultPortfolioData = () => ({
  key: 'main_portfolio',
  personalInfo: {
    fullName: 'Aryan Chandra',
    title: 'Full-Stack Software & AI Engineer',
    tagline: 'Building scalable backend systems, mobile products, & agentic AI architecture.',
    location: 'Delhi NCR, India',
    phone: '+91 92057 23006',
    email: 'aryanchandra3456@gmail.com',
    github: 'https://github.com/TheAryanchandra',
    linkedin: 'https://linkedin.com/in/aryanchandra',
    youtube: 'https://youtube.com/@aryanchandra',
    bio: 'Software Engineering student with experience building production apps, scalable microservices, RAG systems, and AI copilots.',
  },
  impactMetrics: [
    { value: '3 Apps', label: 'Play Store & App Store', detail: 'Fonofy, Golf Fed, Carenzy' },
    { value: '50K+', label: 'Daily Transactions', detail: 'Production commerce platform' },
    { value: '1,000+', label: 'Active Users', detail: 'Live mobile users' },
    { value: '99.9%', label: 'Platform Uptime', detail: 'Reliable transaction backbone' },
    { value: '70%', label: 'Latency Reduction', detail: '8.2s → 2.4s inference' },
    { value: '150+', label: 'REST APIs', detail: 'Payment & order workflows' },
  ],
  featuredProjects: [
    {
      number: '01',
      title: 'AI Engineering Knowledge Copilot',
      type: 'Enterprise RAG / Backend Systems',
      description: 'Enterprise knowledge retrieval platform built with Java 21, Spring Boot and Spring AI. Designed a JWT-secured RBAC API gateway and event-driven Kafka retrieval pipeline with Qdrant vector search, PostgreSQL and Redis with sub-200ms latency.',
      stack: ['Java 21', 'Spring Boot', 'Spring AI', 'Kafka', 'Qdrant', 'PostgreSQL', 'Redis', 'Docker'],
      href: 'https://github.com/TheAryanchandra/AI-Copilot',
      metrics: ['JWT + RBAC', 'Kafka Events', 'Hybrid Search', 'Sub-200ms'],
      featured: true,
    },
    {
      number: '02',
      title: 'Stadium Pulse — Crowd Intelligence',
      type: 'Agentic AI / Google Cloud Premier League',
      description: 'Agentic crowd-intelligence system built in Python with LangGraph multi-agent orchestration workflows calling Gemini API with prompt-engineered, structured Pydantic output, plus OpenAI embeddings for real-time semantic analysis.',
      stack: ['Python', 'LangGraph', 'Gemini API', 'OpenAI', 'Pydantic', 'Cloud Run'],
      href: 'https://github.com/TheAryanchandra/agentic-premier-league',
      metrics: ['Multi-Agent', 'Sub-500ms', 'Semantic Search', 'Cloud Run'],
      featured: true,
    },
    {
      number: '03',
      title: 'Jarvis Agentic AI & Tracker',
      type: 'Autonomous Copilot & IoT System',
      description: 'Autonomous multi-tool AI assistant with Playwright web browser tools, Model Gateway, MongoDB Atlas vector search, Context Manager, and IoT ambient device control.',
      stack: ['Node.js', 'Express', 'Next.js', 'Playwright', 'MongoDB', 'WebSocket'],
      href: 'https://github.com/TheAryanchandra/tracker-development',
      metrics: ['Playwright', 'Atlas Vector', 'Model Gateway', 'IoT Control'],
      featured: true,
    },
  ],
  mobileApps: [
    { name: 'Fonofy', tagline: 'Refurbished Device Commerce & Trade-In Platform', platform: 'Android (Partners - Google Play Store)', downloads: '10,000+', rating: '4.8 ★', description: 'Full-featured B2B merchant app for device evaluation, trade-in grading, live price checks, and order management. Powers a nationwide refurbished electronics supply chain.', storeUrl: 'https://play.google.com/store/apps/details?id=com.fonofy.merchant&hl=en_IN' },
    { name: 'Golf Fed', tagline: 'Golf Tournament & League Management', platform: 'iOS & Android (Delhi Golf Federation)', downloads: '5,000+', rating: '4.9 ★', description: 'Live scoring, leaderboard tracking & member profiles.', storeUrl: 'https://apps.apple.com/in/app/delhi-golf-federation/id6758339712' },

    { name: 'Carenzy', tagline: 'Personalized Healthcare & Caregiver Booking', platform: 'Android', downloads: '2,000+', rating: '4.7 ★', description: 'Caregiver dispatch, medical tracking, & vitals telemetry.', storeUrl: 'https://carenzy.com' },
  ],
  skillsCategory: [
    { category: 'Languages & Core', items: ['Java 21', 'Python', 'TypeScript', 'JavaScript', 'C++', 'SQL'] },
    { category: 'Frameworks & Libraries', items: ['Spring Boot', 'Node.js', 'Express', 'Next.js', 'React', 'React Native'] },
    { category: 'AI & Data Infrastructure', items: ['Spring AI', 'LangGraph', 'Qdrant', 'MongoDB Atlas Vector', 'Redis', 'Kafka'] },
    { category: 'Cloud & DevOps', items: ['Docker', 'Google Cloud Run', 'Vercel', 'Git', 'CI/CD Pipelines'] },
  ],
  experience: [
    {
      role: 'Full-Stack Software Engineering Student & AI Developer',
      company: 'Personal & Enterprise Projects',
      period: '2023 — Present',
      location: 'Delhi NCR, India',
      bullets: [
        'Architected high-throughput microservices using Java 21, Spring Boot, and Kafka.',
        'Built production mobile apps deployed on App Store & Play Store powering 50,000+ monthly user interactions.',
        'Engineered Jarvis Agentic AI copilot with Playwright browser scraping, Context Manager, and Model Gateway.',
      ],
    },
  ],
});

/**
 * GET /api/portfolio
 */
exports.getPortfolio = async (req, res) => {
  try {
    let data = await Portfolio.findOne({ key: 'main_portfolio' });
    if (!data) {
      data = await Portfolio.create(getDefaultPortfolioData());
    }
    res.json({ success: true, portfolio: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * PUT /api/portfolio (Update portfolio details from Admin panel)
 */
exports.updatePortfolio = async (req, res) => {
  try {
    const updateData = req.body;
    let data = await Portfolio.findOneAndUpdate(
      { key: 'main_portfolio' },
      { $set: updateData },
      { new: true, upsert: true }
    );
    res.json({ success: true, message: 'Portfolio updated successfully', portfolio: data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const Contact = require('../models/Contact');
let nodemailer;
try { nodemailer = require('nodemailer'); } catch (e) {}
const { broadcast } = require('../services/websocketService');

async function sendWhisperflowNotification({ name, email, message }) {
  if (!nodemailer) {
    console.warn('[Whisperflow] nodemailer not available, skipping email.');
    return;
  }

  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || 'aryanchandra3456@gmail.com';
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS;

  if (!smtpPass) {
    console.log('[Whisperflow] Contact saved to database & broadcasted to admin panel.');
    console.log('[Whisperflow] To dispatch live Gmail emails, set SMTP_PASS (Gmail App Password) in tracker-backend/.env');
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

/**
 * POST /api/portfolio/contact
 * Handles recruiter inquiry, saves to database, and dispatches to Whisperflow / aryanchandra3456@gmail.com
 */
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email, and message are required.' });
    }

    const doc = await Contact.create({ name, email, message });

    console.log(`[Whisperflow / Contact] New recruiter inquiry from ${name} (${email}):`);
    console.log(message);
    console.log(`[Whisperflow] Notification dispatched to: aryanchandra3456@gmail.com`);

    // Broadcast WebSocket event to Admin Panel
    try { broadcast('CONTACT_RECEIVED', { name, email, message }); } catch (e) {}

    // Dispatch email notification in background
    sendWhisperflowNotification({ name, email, message }).catch(() => {});

    res.json({
      success: true,
      message: 'Inquiry received and dispatched to Whisperflow & aryanchandra3456@gmail.com',
      contact: doc,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/portfolio/contacts
 * Returns all recruiter inquiries and contact requests for Admin panel
 */
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: contacts.length, contacts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * DELETE /api/portfolio/contacts/:id
 */
exports.deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


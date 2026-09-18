/**
 * Portfolio Data Schema
 * ─────────────────────────────────────────────────────────────────────────────
 * Mongoose schema for editable portfolio details: bio, projects, apps, skills,
 * experience, impact metrics, and contact configuration.
 */

const mongoose = require('mongoose');

const PortfolioSchema = new mongoose.Schema({
  key: {
    type: String,
    default: 'main_portfolio',
    unique: true,
  },
  personalInfo: {
    fullName: { type: String, default: 'Aryan Chandra' },
    title: { type: String, default: 'Full-Stack Software & AI Engineer' },
    tagline: { type: String, default: 'Building scalable backend systems, mobile products, & agentic AI architecture.' },
    location: { type: String, default: 'Delhi NCR, India' },
    phone: { type: String, default: '+91 92057 23006' },
    email: { type: String, default: 'aryanchandra3456@gmail.com' },
    github: { type: String, default: 'https://github.com/TheAryanchandra' },
    linkedin: { type: String, default: 'https://linkedin.com/in/aryanchandra' },
    youtube: { type: String, default: 'https://youtube.com/@aryanchandra' },
    resumeUrl: { type: String, default: 'https://drive.google.com/file/d/1fnwhYzbHkrANYvNCtQWQndm9WKlAl2QD/view?usp=sharing' },
    bio: { type: String, default: 'Software Engineering Professional with experience building production apps, scalable microservices, RAG systems, and AI copilots.' },
  },
  impactMetrics: [
    {
      value: String,
      label: String,
      detail: String,
    },
  ],
  featuredProjects: [
    {
      number: String,
      title: String,
      type: { type: String },
      description: String,
      stack: [String],
      href: String,
      metrics: [String],
      featured: { type: Boolean, default: true },
    },
  ],
  mobileApps: [
    {
      name: String,
      tagline: String,
      platform: String,
      downloads: String,
      rating: String,
      description: String,
      storeUrl: String,
    },
  ],
  skillsCategory: [
    {
      category: String,
      items: [String],
    },
  ],
  experience: [
    {
      role: String,
      company: String,
      period: String,
      location: String,
      bullets: [String],
    },
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);

const mongoose = require('mongoose');

/**
 * JobListing — Cached job postings fetched from free APIs.
 * Jobs are cached for 24h to avoid hammering external APIs.
 */
const jobListingSchema = new mongoose.Schema({
  title:      { type: String, required: true },
  company:    { type: String, required: true },
  location:   { type: String, default: 'Remote' },
  type:       { type: String, default: 'Full-time' }, // Full-time, Contract, Internship
  tags:       [String],  // e.g. ["React", "Node.js", "Remote"]
  salary:     { type: String },
  url:        { type: String, required: true },
  source:     { type: String }, // "RemoteOK", "TheMuse", "Adzuna"
  postedAt:   { type: Date },
  fetchedAt:  { type: Date, default: Date.now },
  isNew:      { type: Boolean, default: true }, // flag as new until user has seen it
});

// TTL index: auto-delete after 24 hours
jobListingSchema.index({ fetchedAt: 1 }, { expireAfterSeconds: 86400 });
jobListingSchema.index({ source: 1 });
jobListingSchema.index({ tags: 1 });

module.exports = mongoose.model('JobListing', jobListingSchema);

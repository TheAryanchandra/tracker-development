const mongoose = require('mongoose');

/** Persisted document knowledge used by Jarvis' retrieval layer. */
const jarvisDocumentSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  content: { type: String, required: true },
  docType: { type: String, default: 'document' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  uploadedAt: { type: Date, default: Date.now },
}, { timestamps: true });

jarvisDocumentSchema.index({ uploadedAt: -1 });

module.exports = mongoose.models.JarvisDocument || mongoose.model('JarvisDocument', jarvisDocumentSchema);

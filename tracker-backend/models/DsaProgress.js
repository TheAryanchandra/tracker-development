const mongoose = require('mongoose');

const DsaProgressSchema = new mongoose.Schema(
  {
    topic: { type: String, required: true, unique: true },
    totalProblems: { type: Number, default: 0 },
    problemsSolved: { type: Number, default: 0 },
    percentComplete: { type: Number, default: 0 },
    status: { type: String, default: 'Add problem count' },
  },
  { timestamps: true }
);

// Auto compute percent complete before saving
DsaProgressSchema.pre('save', function (next) {
  if (this.totalProblems > 0) {
    this.percentComplete = Math.round((this.problemsSolved / this.totalProblems) * 100);
  } else {
    this.percentComplete = 0;
  }
  next();
});

module.exports = mongoose.model('DsaProgress', DsaProgressSchema);

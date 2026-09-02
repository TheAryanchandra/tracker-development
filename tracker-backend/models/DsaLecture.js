const mongoose = require('mongoose');

const DsaLectureSchema = new mongoose.Schema(
  {
    srNo: { type: Number },
    url: { type: String, required: true },
    title: { type: String, required: true },
    duration: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DsaLecture', DsaLectureSchema);

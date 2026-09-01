const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', default: null, index: true },
  reason: { type: String, enum: ['underage', 'non-consensual', 'fraud', 'privacy', 'illegal', 'spam', 'other'], required: true },
  details: { type: String, trim: true, maxlength: 2000, default: '' },
  reporterEmail: { type: String, lowercase: true, trim: true, maxlength: 180, default: '' },
  status: { type: String, enum: ['open', 'reviewing', 'resolved', 'dismissed'], default: 'open', index: true },
  ipHash: { type: String, select: false },
  resolutionNotes: { type: String, trim: true, maxlength: 2000, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);

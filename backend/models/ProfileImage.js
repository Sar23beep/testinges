const mongoose = require('mongoose');

const profileImageSchema = new mongoose.Schema({
  profile: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true, index: true },
  url: { type: String, required: true },
  publicId: { type: String, required: true, unique: true },
  width: Number,
  height: Number,
  format: String,
  bytes: Number,
  alt: { type: String, trim: true, maxlength: 160, default: '' },
  isMain: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

profileImageSchema.index({ profile: 1, isMain: -1, sortOrder: 1 });

module.exports = mongoose.model('ProfileImage', profileImageSchema);

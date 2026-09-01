const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  state: { type: String, trim: true, maxlength: 100, default: '' },
  tier: { type: String, trim: true, maxlength: 50, default: '' },
  areas: [{ type: String, trim: true }],
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  h1: { type: String, trim: true, maxlength: 180, default: '' },
  seoTitle: { type: String, trim: true, maxlength: 120, default: '' },
  seoDescription: { type: String, trim: true, maxlength: 170, default: '' },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

citySchema.index({ active: 1, sortOrder: 1, name: 1 });
citySchema.index({ state: 1 });

module.exports = mongoose.model('City', citySchema);

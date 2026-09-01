const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  description: { type: String, trim: true, maxlength: 5000, default: '' },
  h1: { type: String, trim: true, maxlength: 180, default: '' },
  seoTitle: { type: String, trim: true, maxlength: 70, default: '' },
  seoDescription: { type: String, trim: true, maxlength: 170, default: '' },
  active: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

categorySchema.index({ active: 1, sortOrder: 1, name: 1 });

module.exports = mongoose.model('Category', categorySchema);

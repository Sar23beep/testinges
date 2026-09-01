const mongoose = require('mongoose');

const seoPageSchema = new mongoose.Schema({
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  seoTitle: { type: String, trim: true, maxlength: 70, default: '' },
  seoDescription: { type: String, trim: true, maxlength: 170, default: '' },
  h1: { type: String, trim: true, maxlength: 180, default: '' },
  introContent: { type: String, trim: true, maxlength: 5000, default: '' },
  indexable: { type: Boolean, default: true }
}, { timestamps: true });

seoPageSchema.index({ city: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('SeoPage', seoPageSchema);

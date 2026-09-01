const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/ },
  city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true, index: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  description: { type: String, required: true, trim: true, maxlength: 6000 },
  displayAge: { type: Number, min: 18, max: 99 },
  heightCm: { type: Number, min: 120, max: 220 },
  languages: [{ type: String, trim: true, maxlength: 40 }],
  availability: { type: String, enum: ['', 'Flexible', 'Daytime', 'Evening', 'Night'], default: '' },
  area: { type: String, trim: true, maxlength: 120, default: '' },
  phone: { type: String, trim: true, maxlength: 24, default: '', select: false },
  whatsapp: { type: String, required: true, trim: true, maxlength: 24, select: false },
  badge: { type: String, enum: ['NORMAL', 'HOT', 'VIP', 'VVIP'], default: 'NORMAL', index: true },
  tags: [{ type: String, trim: true, maxlength: 40 }],
  featured: { type: Boolean, default: false, index: true },
  status: { type: String, enum: ['draft', 'published', 'hidden'], default: 'draft', index: true },
  ageVerified: { type: Boolean, required: true, default: false },
  consentVerified: { type: Boolean, required: true, default: false },
  seoTitle: { type: String, trim: true, maxlength: 70, default: '' },
  seoDescription: { type: String, trim: true, maxlength: 170, default: '' },
  seoOgImage: { type: String, trim: true, default: '' },
  deletedAt: { type: Date, default: null, index: true },
  publishedAt: Date
}, { timestamps: true });

profileSchema.index({ status: 1, deletedAt: 1, city: 1, category: 1, badge: 1 });
profileSchema.index({ name: 'text', description: 'text' });
profileSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Profile', profileSchema);

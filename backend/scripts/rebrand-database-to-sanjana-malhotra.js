const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const SeoPage = require('../models/SeoPage');
const Setting = require('../models/Setting');

async function rebrandDatabase() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  // 1. Update Settings
  await Setting.findOneAndUpdate(
    {},
    {
      siteName: 'Sanjana Malhotra',
      contactEmail: process.env.CONTACT_EMAIL || 'contact@sanjanamalhotra.com',
      footerText: 'A curated, privacy-conscious directory for adults. We do not process bookings or payments.'
    },
    { upsert: true }
  );
  console.log('✓ SiteSetting updated to Sanjana Malhotra');

  // 2. Update Cities
  const cities = await City.find({});
  for (const city of cities) {
    let changed = false;
    if (city.seoTitle && city.seoTitle.includes('Veloura')) {
      city.seoTitle = city.seoTitle.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (city.seoDescription && city.seoDescription.includes('Veloura')) {
      city.seoDescription = city.seoDescription.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (changed) await city.save();
  }
  console.log(`✓ Updated Cities SEO metadata (${cities.length} cities checked).`);

  // 3. Update Categories
  const categories = await Category.find({});
  for (const cat of categories) {
    let changed = false;
    if (cat.seoTitle && cat.seoTitle.includes('Veloura')) {
      cat.seoTitle = cat.seoTitle.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (cat.seoDescription && cat.seoDescription.includes('Veloura')) {
      cat.seoDescription = cat.seoDescription.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (changed) await cat.save();
  }
  console.log(`✓ Updated Categories SEO metadata (${categories.length} categories checked).`);

  // 4. Update Profiles
  const profiles = await Profile.find({});
  let profileUpdateCount = 0;
  for (const p of profiles) {
    let changed = false;
    if (p.seoTitle && p.seoTitle.includes('Veloura')) {
      p.seoTitle = p.seoTitle.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (p.seoDescription && p.seoDescription.includes('Veloura')) {
      p.seoDescription = p.seoDescription.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (p.description && p.description.includes('Veloura')) {
      p.description = p.description.replace(/Veloura/g, 'Sanjana Malhotra');
      changed = true;
    }
    if (changed) {
      await p.save();
      profileUpdateCount++;
    }
  }
  console.log(`✓ Updated ${profileUpdateCount} Profiles with Sanjana Malhotra branding.`);

  console.log('\n========================================');
  console.log('✓ COMPLETE: Entire Database Rebranded to Sanjana Malhotra!');
  console.log('========================================\n');

  await mongoose.disconnect();
}

rebrandDatabase().catch((err) => {
  console.error('Error in rebranding DB:', err);
  process.exit(1);
});

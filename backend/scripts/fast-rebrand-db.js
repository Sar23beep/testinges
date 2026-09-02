const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const Setting = require('../models/Setting');

async function fastRebrand() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  await Setting.findOneAndUpdate(
    {},
    {
      siteName: 'Sanjana Malhotra',
      contactEmail: process.env.CONTACT_EMAIL || 'contact@sanjanamalhotra.com',
      footerText: 'A curated, privacy-conscious directory for adults. We do not process bookings or payments.'
    },
    { upsert: true }
  );

  // 1. Bulk update Cities
  const cities = await City.find({
    $or: [{ seoTitle: /Veloura/ }, { seoDescription: /Veloura/ }]
  });
  if (cities.length > 0) {
    const cityOps = cities.map(c => ({
      updateOne: {
        filter: { _id: c._id },
        update: {
          $set: {
            seoTitle: (c.seoTitle || '').replace(/Veloura/g, 'Sanjana Malhotra'),
            seoDescription: (c.seoDescription || '').replace(/Veloura/g, 'Sanjana Malhotra')
          }
        }
      }
    }));
    await City.bulkWrite(cityOps);
    console.log(`✓ Bulk updated ${cities.length} Cities.`);
  }

  // 2. Bulk update Categories
  const categories = await Category.find({
    $or: [{ seoTitle: /Veloura/ }, { seoDescription: /Veloura/ }]
  });
  if (categories.length > 0) {
    const catOps = categories.map(c => ({
      updateOne: {
        filter: { _id: c._id },
        update: {
          $set: {
            seoTitle: (c.seoTitle || '').replace(/Veloura/g, 'Sanjana Malhotra'),
            seoDescription: (c.seoDescription || '').replace(/Veloura/g, 'Sanjana Malhotra')
          }
        }
      }
    }));
    await Category.bulkWrite(catOps);
    console.log(`✓ Bulk updated ${categories.length} Categories.`);
  }

  // 3. Bulk update Profiles
  const profiles = await Profile.find({
    $or: [
      { seoTitle: /Veloura/ },
      { seoDescription: /Veloura/ },
      { description: /Veloura/ }
    ]
  });
  if (profiles.length > 0) {
    const profileOps = profiles.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            seoTitle: (p.seoTitle || '').replace(/Veloura/g, 'Sanjana Malhotra'),
            seoDescription: (p.seoDescription || '').replace(/Veloura/g, 'Sanjana Malhotra'),
            description: (p.description || '').replace(/Veloura/g, 'Sanjana Malhotra')
          }
        }
      }
    }));
    await Profile.bulkWrite(profileOps);
    console.log(`✓ Bulk updated ${profiles.length} Profiles.`);
  }

  console.log('✓ Fast bulk rebrand complete!');
  await mongoose.disconnect();
}

fastRebrand().catch(console.error);

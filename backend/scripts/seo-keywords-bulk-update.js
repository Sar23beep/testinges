const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');

const whatsappNumber = process.env.WHATSAPP_NUMBER || '6351615378';

async function updateAllKeywords() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  // 1. Bulk Update Cities
  const cities = await City.find({});
  const cityOps = cities.map(c => ({
    updateOne: {
      filter: { _id: c._id },
      update: {
        $set: {
          seoTitle: `Call Girls in ${c.name} - 100% Genuine Escorts in ${c.name} | Sanjana Malhotra`.slice(0, 70),
          seoDescription: `Find verified Call Girls in ${c.name} & independent escorts. Real photos, VIP service, direct WhatsApp ${whatsappNumber}. 100% genuine profiles in ${c.name}.`.slice(0, 170),
          h1: `Call Girls in ${c.name} — Verified Escorts & Companions`
        }
      }
    }
  }));
  if (cityOps.length) {
    await City.bulkWrite(cityOps);
    console.log(`✓ Bulk updated ${cityOps.length} Cities with target keywords!`);
  }

  // 2. Bulk Update Categories
  const categories = await Category.find({});
  const catOps = categories.map(cat => ({
    updateOne: {
      filter: { _id: cat._id },
      update: {
        $set: {
          seoTitle: `${cat.name} Call Girls & Verified Escorts in India | Sanjana Malhotra`.slice(0, 70),
          seoDescription: `Explore verified ${cat.name.toLowerCase()} call girls, VIP models and independent escorts across all major Indian cities. Direct WhatsApp on ${whatsappNumber}.`.slice(0, 170),
          h1: `${cat.name} Call Girls & Escorts`
        }
      }
    }
  }));
  if (catOps.length) {
    await Category.bulkWrite(catOps);
    console.log(`✓ Bulk updated ${catOps.length} Categories with target keywords!`);
  }

  // 3. Bulk Update Profiles
  const profiles = await Profile.find({}).populate('city category');
  const profileOps = profiles.map(p => {
    const cityName = p.city ? p.city.name : 'India';
    const areaName = p.area || cityName;
    const catName = p.category ? p.category.name : 'VIP';
    return {
      updateOne: {
        filter: { _id: p._id },
        update: {
          $set: {
            seoTitle: `${p.name} (${p.displayAge || 22} Yrs) - Call Girl in ${areaName}, ${cityName} | WhatsApp ${whatsappNumber}`.slice(0, 70),
            seoDescription: `Meet ${p.name}, 18+ verified independent call girl in ${areaName}, ${cityName}. Direct WhatsApp & Call ${whatsappNumber}. Genuine photos & zero advance.`.slice(0, 170),
            description: `${p.name} is a verified 18+ independent companion available for genuine meetings in ${areaName}, ${cityName}. Direct WhatsApp & Call (+91 ${whatsappNumber}) with 100% discretion and privacy.`
          }
        }
      }
    };
  });
  if (profileOps.length) {
    await Profile.bulkWrite(profileOps);
    console.log(`✓ Bulk updated ${profileOps.length} Profiles with target keywords!`);
  }

  console.log('\n========================================');
  console.log('✓ COMPLETE: High-Ranking Keywords Configured Across Entire DB!');
  console.log('========================================\n');

  await mongoose.disconnect();
}

updateAllKeywords().catch(console.error);

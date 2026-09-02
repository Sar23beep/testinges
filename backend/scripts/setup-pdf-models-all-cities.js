const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');

const extractedDir = path.join(__dirname, '../../images/extracted_models');
const targetProfilesDir = path.join(__dirname, '../public/images/profiles');

if (!fs.existsSync(targetProfilesDir)) {
  fs.mkdirSync(targetProfilesDir, { recursive: true });
}

// 1. Gather all high quality model photos
const newModelImages = [];

// List of high quality rendered pages and raw photos from PDFs
const pdfImages = fs.readdirSync(extractedDir).filter(f => f.includes('_page_') && /\.(jpe?g|png)$/i.test(f));
console.log(`Found ${pdfImages.length} model photos from PDFs.`);

pdfImages.forEach((file, idx) => {
  const ext = path.extname(file) || '.jpeg';
  const destName = `model-pdf-${idx + 1}${ext}`;
  fs.copyFileSync(path.join(extractedDir, file), path.join(targetProfilesDir, destName));
  newModelImages.push(destName);
});

// Also include previous existing 24 photos
for (let i = 1; i <= 24; i++) {
  const existingName = `profile-photo-${i}.jpeg`;
  if (fs.existsSync(path.join(targetProfilesDir, existingName))) {
    newModelImages.push(existingName);
  }
}

console.log(`Total available unique photo assets: ${newModelImages.length}`);

const modelProfilesData = [
  {
    name: 'Dolly',
    age: 22,
    height: 165,
    bio: 'Charming, stylish, and lively companion with a friendly persona. Fluent in Hindi and English, offering discreet companionship and warm hospitality.',
    tags: ['Verified 18+', 'Fashion Model', 'Discreet', 'Warm Host']
  },
  {
    name: 'Sonia',
    age: 24,
    height: 168,
    bio: 'Sophisticated and elegant high-profile model. Loves fine dining, classy social events, and relaxing private conversations.',
    tags: ['Verified 18+', 'VIP Elite', 'Direct Contact', 'Independent']
  },
  {
    name: 'Ashley',
    age: 23,
    height: 170,
    bio: 'Glamorous and confident companion with an alluring presence. Perfect for upscale dinners, travel companion, and private relaxation.',
    tags: ['Verified 18+', 'Celebrity Look', 'Luxury Lifestyle', 'Discreet']
  },
  {
    name: 'Aarohi',
    age: 22,
    height: 162,
    bio: 'Sweet, bubbly, and polite young model with radiant charm. Great listener and wonderful company for evenings out.',
    tags: ['Verified 18+', 'College Girl', 'Sweet & Caring', 'Direct Contact']
  },
  {
    name: 'Priya',
    age: 25,
    height: 167,
    bio: 'Classy independent model with magnetic charm and graceful manners. Verified identity and privacy-focused.',
    tags: ['Verified 18+', 'Independent', 'Classy & Mature', 'Discreet']
  },
  {
    name: 'Kiara',
    age: 23,
    height: 166,
    bio: 'Fashion forward, radiant, and energetic companion who loves vibrant conversations and pleasant outings.',
    tags: ['Verified 18+', 'Fashionista', 'VIP Model', 'Zero Middlemen']
  },
  {
    name: 'Maya',
    age: 26,
    height: 169,
    bio: 'Refined, cultured, and sophisticated model offering bespoke companionship for discerning individuals.',
    tags: ['Verified 18+', 'High Profile', 'Elite Companion', 'Privacy First']
  },
  {
    name: 'Naina',
    age: 21,
    height: 164,
    bio: 'Enthusiastic and charming young companion with an authentic and warm personality. Safe, discreet, and direct contact.',
    tags: ['Verified 18+', 'Young & Vibrant', 'Discreet Hospitality', 'Verified 100%']
  },
  {
    name: 'Tanya',
    age: 24,
    height: 165,
    bio: 'Polite, well-spoken, and glamorous companion available for discreet meetings and memorable times.',
    tags: ['Verified 18+', 'Air Hostess Look', 'Polite & Cultured', 'Discreet']
  },
  {
    name: 'Riya',
    age: 22,
    height: 163,
    bio: 'Trendy and lively companion with a warm smile and great sense of humor. Direct WhatsApp contact only.',
    tags: ['Verified 18+', 'Casual & Fun', 'Verified Model', 'Direct WhatsApp']
  }
];

const badges = ['VIP', 'HOT', 'VVIP', 'NORMAL'];
const availabilities = ['Flexible', 'Evening', 'Night', 'Daytime'];

function makeValidSlug(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function setupPdfModelsAcrossAllCities() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const categories = await Category.find({ active: true });
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Setting up PDF models and unique photos across all ${cities.length} cities...`);

  let totalUpdatedProfiles = 0;
  let totalUpdatedImages = 0;

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    let profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });

    // Keep 4 to 6 unique profiles per city
    const targetCount = Math.min(Math.max(profiles.length, 3), 6);
    if (profiles.length > targetCount) {
      const toRemove = profiles.slice(targetCount);
      const toRemoveIds = toRemove.map(p => p._id);
      await Profile.deleteMany({ _id: { $in: toRemoveIds } });
      await ProfileImage.deleteMany({ profile: { $in: toRemoveIds } });
      profiles = profiles.slice(0, targetCount);
    }

    const modelOffset = (cIdx * 3) % modelProfilesData.length;
    const photoOffset = (cIdx * 4) % newModelImages.length;

    const usedNamesInCity = new Set();
    const usedPhotosInCity = new Set();

    for (let pIdx = 0; pIdx < profiles.length; pIdx++) {
      const profile = profiles[pIdx];

      // Pick unique model data
      let mIdx = (modelOffset + pIdx) % modelProfilesData.length;
      while (usedNamesInCity.has(modelProfilesData[mIdx].name)) {
        mIdx = (mIdx + 1) % modelProfilesData.length;
      }
      const model = modelProfilesData[mIdx];
      usedNamesInCity.add(model.name);

      // Pick unique photo
      let imgIdx = (photoOffset + pIdx) % newModelImages.length;
      while (usedPhotosInCity.has(newModelImages[imgIdx])) {
        imgIdx = (imgIdx + 1) % newModelImages.length;
      }
      const chosenPhoto = newModelImages[imgIdx];
      usedPhotosInCity.add(chosenPhoto);

      const cat = categories[(cIdx + pIdx) % categories.length];
      const badge = badges[(cIdx + pIdx) % badges.length];
      const availability = availabilities[(cIdx + pIdx) % availabilities.length];
      const area = profile.area || (city.areas && city.areas[pIdx % city.areas.length]) || `${city.name} Centre`;

      const areaSlug = makeValidSlug(area);
      let newSlug = `${makeValidSlug(model.name)}-${city.slug}-${areaSlug}-${pIdx + 1}`.slice(0, 75).replace(/-+$/, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
        newSlug = `${makeValidSlug(model.name)}-${city.slug.slice(0, 20)}-${pIdx + 1}`;
      }

      // Update Profile Details
      profile.name = model.name;
      profile.slug = newSlug;
      profile.category = cat._id;
      profile.badge = badge;
      profile.availability = availability;
      profile.displayAge = model.age;
      profile.heightCm = model.height;
      profile.area = area;
      profile.whatsapp = '916351615378';
      profile.phone = '6351615378';
      profile.status = 'published';
      profile.featured = (pIdx === 0);
      profile.description = `${model.bio} Available in ${area}, ${city.name} (${city.state}) with direct WhatsApp and Call contact (+91 6351615378). 100% verified 18+ profile.`;
      profile.tags = [...model.tags, cat.name, area];
      profile.seoTitle = `${model.name} - 18+ Verified ${cat.name} in ${city.name}`.slice(0, 70);
      profile.seoDescription = `Connect directly with ${model.name} in ${area}, ${city.name}. Genuine photos and direct contact on WhatsApp 6351615378.`.slice(0, 170);
      await profile.save();
      totalUpdatedProfiles++;

      // Link Image
      await ProfileImage.deleteMany({ profile: profile._id });
      const publicId = `img-${profile._id}-1`;
      await ProfileImage.create({
        profile: profile._id,
        url: `/images/profiles/${chosenPhoto}`,
        publicId,
        width: 800,
        height: 1000,
        format: 'jpeg',
        alt: `${model.name} verified profile in ${area}, ${city.name}`,
        isMain: true,
        sortOrder: 0
      });
      totalUpdatedImages++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: PDF Models and Unique Details Configured!`);
  console.log(`✓ Total Cities: ${cities.length}`);
  console.log(`✓ Total Profiles Updated: ${totalUpdatedProfiles}`);
  console.log(`✓ Total Images Configured: ${totalUpdatedImages}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

setupPdfModelsAcrossAllCities().catch((err) => {
  console.error('Error setting up PDF models:', err);
  process.exit(1);
});

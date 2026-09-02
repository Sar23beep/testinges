const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');

const downloadsDir = path.join(process.env.USERPROFILE, 'Downloads');
const targetProfilesDir = path.join(__dirname, '../public/images/profiles');
const imagesBackupDir = path.join(__dirname, '../../images');

if (!fs.existsSync(targetProfilesDir)) fs.mkdirSync(targetProfilesDir, { recursive: true });
if (!fs.existsSync(imagesBackupDir)) fs.mkdirSync(imagesBackupDir, { recursive: true });

// Copy the 3 new images from Downloads
const newImagesMapping = [
  {
    src: 'riya-mahera-aerocity-escort-service-escort-in-gorakhpur-15449396_original.jpg',
    dest: 'model-riya-shimmer.jpeg'
  },
  {
    src: 'maria-independent-russian-girl-russian-escort-in-new-delhi-9903898_original.jpg',
    dest: 'model-maria-cute.jpeg'
  },
  {
    src: 'new-new-new-3some-available-singaporean-escort-in-new-delhi-8448382_original.jpg',
    dest: 'model-kavya-bold.jpeg'
  }
];

for (const item of newImagesMapping) {
  const srcPath = path.join(downloadsDir, item.src);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, path.join(targetProfilesDir, item.dest));
    fs.copyFileSync(srcPath, path.join(imagesBackupDir, item.dest));
    console.log(`✓ Copied ${item.src} -> ${item.dest}`);
  } else {
    console.log(`! Source not found at ${srcPath}`);
  }
}

// Gather all available distinct photos in public/images/profiles
const allAvailablePhotos = fs.readdirSync(targetProfilesDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
console.log(`Total available distinct photo assets in library: ${allAvailablePhotos.length}`);

// Define rich model identities
const comprehensiveModels = [
  {
    name: 'Riya',
    age: 23,
    height: 168,
    preferredPhoto: 'model-riya-shimmer.jpeg',
    bio: 'Gorgeous, glamorous, and stylish fashion model. Known for her radiant smile, high fashion sense, and charming social presence.',
    tags: ['Verified 18+', 'Glamour Model', 'Party Companion', 'Discreet']
  },
  {
    name: 'Maria',
    age: 21,
    height: 165,
    preferredPhoto: 'model-maria-cute.jpeg',
    bio: 'Cute, youthful, and lively companion with a friendly persona. Fluent in English and Hindi, providing relaxed and delightful company.',
    tags: ['Verified 18+', 'Russian Look', 'Sweet & Playful', 'Direct Contact']
  },
  {
    name: 'Kavya',
    age: 24,
    height: 170,
    preferredPhoto: 'model-kavya-bold.jpeg',
    bio: 'Bold, confident, and sensational VIP model. Offers high-class bespoke companionship with elegance, warmth, and absolute privacy.',
    tags: ['Verified 18+', 'VIP Elite', 'Bold & Glamorous', 'Zero Middlemen']
  },
  {
    name: 'Dolly',
    age: 22,
    height: 165,
    preferredPhoto: 'model-pdf-1.jpeg',
    bio: 'Charming, stylish, and all-rounder companion with a warm and caring personality. Fluent in Hindi and English with discreet hospitality.',
    tags: ['Verified 18+', 'All Rounder', 'Traditional & Modern', 'Warm Host']
  },
  {
    name: 'Sonia',
    age: 24,
    height: 168,
    preferredPhoto: 'model-pdf-10.jpeg',
    bio: 'Sophisticated and elegant high-profile model. Loves upscale dining, classy social events, and relaxing private conversations.',
    tags: ['Verified 18+', 'High Profile', 'Independent', 'Privacy First']
  },
  {
    name: 'Ashley',
    age: 23,
    height: 170,
    preferredPhoto: 'model-pdf-20.jpeg',
    bio: 'Glamorous and confident companion with an alluring presence. Perfect for dinner dates, travel companion, and luxury relaxation.',
    tags: ['Verified 18+', 'Celebrity Look', 'Luxury Lifestyle', 'Discreet']
  },
  {
    name: 'Aarohi',
    age: 22,
    height: 162,
    preferredPhoto: 'profile-photo-1.jpeg',
    bio: 'Sweet, bubbly, and polite young model with radiant charm. Great listener and wonderful company for pleasant evenings.',
    tags: ['Verified 18+', 'College Girl', 'Sweet & Caring', 'Direct Contact']
  },
  {
    name: 'Priya',
    age: 25,
    height: 167,
    preferredPhoto: 'profile-photo-2.jpeg',
    bio: 'Classy independent model with magnetic charm and graceful manners. Verified identity and privacy-focused direct contact.',
    tags: ['Verified 18+', 'Independent', 'Classy & Mature', 'Discreet']
  },
  {
    name: 'Kiara',
    age: 23,
    height: 166,
    preferredPhoto: 'profile-photo-3.jpeg',
    bio: 'Fashion forward, radiant, and energetic companion who loves vibrant conversations and pleasant outings.',
    tags: ['Verified 18+', 'Fashionista', 'VIP Model', 'Verified 100%']
  },
  {
    name: 'Maya',
    age: 26,
    height: 169,
    preferredPhoto: 'profile-photo-4.jpeg',
    bio: 'Refined, cultured, and sophisticated model offering bespoke companionship for discerning individuals.',
    tags: ['Verified 18+', 'High Profile', 'Elite Companion', 'Privacy First']
  },
  {
    name: 'Naina',
    age: 21,
    height: 164,
    preferredPhoto: 'profile-photo-5.jpeg',
    bio: 'Enthusiastic and charming young companion with an authentic and warm personality. Safe, discreet, and direct contact.',
    tags: ['Verified 18+', 'Young & Vibrant', 'Discreet Hospitality', 'Direct WhatsApp']
  },
  {
    name: 'Tanya',
    age: 24,
    height: 165,
    preferredPhoto: 'profile-photo-6.jpeg',
    bio: 'Polite, well-spoken, and glamorous companion available for discreet meetings and memorable times.',
    tags: ['Verified 18+', 'Air Hostess Look', 'Polite & Cultured', 'Discreet']
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

async function updateAllCitiesWithNewImages() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const categories = await Category.find({ active: true });
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Setting up new models and images across all ${cities.length} cities...`);

  let totalUpdatedProfiles = 0;
  let totalUpdatedImages = 0;

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    let profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });

    // 4 to 6 unique profiles per city
    const targetCount = Math.min(Math.max(profiles.length, 3), 6);
    if (profiles.length > targetCount) {
      const toRemove = profiles.slice(targetCount);
      const toRemoveIds = toRemove.map(p => p._id);
      await Profile.deleteMany({ _id: { $in: toRemoveIds } });
      await ProfileImage.deleteMany({ profile: { $in: toRemoveIds } });
      profiles = profiles.slice(0, targetCount);
    }

    const modelOffset = (cIdx * 3) % comprehensiveModels.length;
    const photoOffset = (cIdx * 5) % allAvailablePhotos.length;

    const usedNamesInCity = new Set();
    const usedPhotosInCity = new Set();

    for (let pIdx = 0; pIdx < profiles.length; pIdx++) {
      const profile = profiles[pIdx];

      // Pick unique model identity
      let mIdx = (modelOffset + pIdx) % comprehensiveModels.length;
      while (usedNamesInCity.has(comprehensiveModels[mIdx].name)) {
        mIdx = (mIdx + 1) % comprehensiveModels.length;
      }
      const model = comprehensiveModels[mIdx];
      usedNamesInCity.add(model.name);

      // Pick unique photo (prefer model's photo if available and unused in city, otherwise rotate through allAvailablePhotos)
      let chosenPhoto = model.preferredPhoto && fs.existsSync(path.join(targetProfilesDir, model.preferredPhoto)) && !usedPhotosInCity.has(model.preferredPhoto)
        ? model.preferredPhoto
        : null;

      if (!chosenPhoto) {
        let imgIdx = (photoOffset + pIdx) % allAvailablePhotos.length;
        while (usedPhotosInCity.has(allAvailablePhotos[imgIdx])) {
          imgIdx = (imgIdx + 1) % allAvailablePhotos.length;
        }
        chosenPhoto = allAvailablePhotos[imgIdx];
      }
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
      profile.description = `${model.bio} Available in ${area}, ${city.name} (${city.state}) with direct WhatsApp and Call contact (+91 6351615378). 100% verified 18+ independent profile.`;
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
  console.log(`✓ COMPLETE: Updated All Cities with New Models & Photos!`);
  console.log(`✓ Total Cities: ${cities.length}`);
  console.log(`✓ Total Profiles Updated: ${totalUpdatedProfiles}`);
  console.log(`✓ Total Images Linked: ${totalUpdatedImages}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

updateAllCitiesWithNewImages().catch((err) => {
  console.error('Error updating models:', err);
  process.exit(1);
});

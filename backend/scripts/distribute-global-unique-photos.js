const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');

const targetProfilesDir = path.join(__dirname, '../public/images/profiles');

// Get all 55 distinct photo files
const allPhotos = fs.readdirSync(targetProfilesDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
console.log(`Loaded ${allPhotos.length} unique photo files from disk.`);

const modelNames = [
  'Riya', 'Dolly', 'Sonia', 'Ashley', 'Maria', 'Kavya', 'Aarohi', 'Priya', 
  'Kiara', 'Maya', 'Naina', 'Tanya', 'Simran', 'Pooja', 'Neha', 'Sneha', 
  'Shreya', 'Divya', 'Aisha', 'Muskan', 'Natasha', 'Alisha', 'Ritu', 'Meera', 
  'Sanya', 'Tanvi', 'Payal', 'Sonam', 'Karishma', 'Kriti', 'Avantika', 'Radhika', 
  'Isha', 'Trisha', 'Anushka', 'Roshni', 'Aditi', 'Nikita', 'Jhanvi', 'Khushi', 
  'Rupali', 'Sonali', 'Sheetal', 'Poonam', 'Deepika', 'Kajal', 'Anjali', 'Swati', 
  'Rekha', 'Tara', 'Ishani', 'Diya', 'Bhavna', 'Reena', 'Monika'
];

const modelBios = {
  'Riya': 'Gorgeous, glamorous, and stylish fashion model. Known for her radiant smile, high fashion sense, and charming social presence.',
  'Dolly': 'Charming, stylish, and all-rounder companion with a warm and caring personality. Fluent in Hindi and English with discreet hospitality.',
  'Sonia': 'Sophisticated and elegant high-profile model. Loves upscale dining, classy social events, and relaxing private conversations.',
  'Ashley': 'Glamorous and confident companion with an alluring presence. Perfect for dinner dates, travel companion, and luxury relaxation.',
  'Maria': 'Cute, youthful, and lively companion with a friendly persona. Fluent in English and Hindi, providing relaxed and delightful company.',
  'Kavya': 'Bold, confident, and sensational VIP model. Offers high-class bespoke companionship with elegance, warmth, and absolute privacy.',
  'Aarohi': 'Sweet, bubbly, and polite young model with radiant charm. Great listener and wonderful company for pleasant evenings.',
  'Priya': 'Classy independent model with magnetic charm and graceful manners. Verified identity and privacy-focused direct contact.',
  'Kiara': 'Fashion forward, radiant, and energetic companion who loves vibrant conversations and pleasant outings.',
  'Maya': 'Refined, cultured, and sophisticated model offering bespoke companionship for discerning individuals.',
  'Naina': 'Enthusiastic and charming young companion with an authentic and warm personality. Safe, discreet, and direct contact.',
  'Tanya': 'Polite, well-spoken, and glamorous companion available for discreet meetings and memorable times.'
};

const defaultBio = 'Independent 18+ verified companion providing discreet hospitality, charming company, and authentic connection. Direct contact on WhatsApp.';

const badges = ['VIP', 'HOT', 'VVIP', 'NORMAL'];
const availabilities = ['Flexible', 'Evening', 'Night', 'Daytime'];

function makeValidSlug(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function distributeGlobalUnique() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const categories = await Category.find({ active: true }).sort({ sortOrder: 1 });
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Distributing globally unique photos across ${cities.length} cities...`);

  let globalCounter = 0;
  let totalProfilesUpdated = 0;
  let totalImagesUpdated = 0;

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    let profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });

    // Keep 3 to 5 profiles per city
    const targetCount = Math.min(Math.max(profiles.length, 3), 5);
    if (profiles.length > targetCount) {
      const toRemove = profiles.slice(targetCount);
      const toRemoveIds = toRemove.map(p => p._id);
      await Profile.deleteMany({ _id: { $in: toRemoveIds } });
      await ProfileImage.deleteMany({ profile: { $in: toRemoveIds } });
      profiles = profiles.slice(0, targetCount);
    }

    const usedNamesInThisCity = new Set();
    const usedPhotosInThisCity = new Set();

    for (let pIdx = 0; pIdx < profiles.length; pIdx++) {
      const profile = profiles[pIdx];

      // Pick name using continuous global counter, ensuring uniqueness within this city
      let nIdx = (globalCounter) % modelNames.length;
      while (usedNamesInThisCity.has(modelNames[nIdx])) {
        nIdx = (nIdx + 1) % modelNames.length;
      }
      const chosenName = modelNames[nIdx];
      usedNamesInThisCity.add(chosenName);

      // Pick photo using continuous global counter, ensuring uniqueness within this city
      let pPhotoIdx = (globalCounter) % allPhotos.length;
      while (usedPhotosInThisCity.has(allPhotos[pPhotoIdx])) {
        pPhotoIdx = (pPhotoIdx + 1) % allPhotos.length;
      }
      const chosenPhoto = allPhotos[pPhotoIdx];
      usedPhotosInThisCity.add(chosenPhoto);

      // Distribute badges and categories across profiles
      const cat = categories[globalCounter % categories.length];
      const badge = badges[globalCounter % badges.length];
      const availability = availabilities[globalCounter % availabilities.length];
      const isFeatured = (globalCounter % 7 === 0); // Only 1 in 7 is featured globally

      const area = profile.area || (city.areas && city.areas[pIdx % city.areas.length]) || `${city.name} Centre`;
      const areaSlug = makeValidSlug(area);
      let newSlug = `${makeValidSlug(chosenName)}-${city.slug}-${areaSlug}-${pIdx + 1}`.slice(0, 75).replace(/-+$/, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
        newSlug = `${makeValidSlug(chosenName)}-${city.slug.slice(0, 20)}-${pIdx + 1}`;
      }

      const bio = modelBios[chosenName] || defaultBio;
      const age = 21 + (globalCounter % 9);
      const height = 158 + ((globalCounter * 3) % 18);

      // Update Profile document
      profile.name = chosenName;
      profile.slug = newSlug;
      profile.category = cat._id;
      profile.badge = badge;
      profile.availability = availability;
      profile.displayAge = age;
      profile.heightCm = height;
      profile.area = area;
      profile.whatsapp = '916351615378';
      profile.phone = '6351615378';
      profile.status = 'published';
      profile.featured = isFeatured;
      // Stagger createdAt timestamp slightly so global sorting is clean and predictable
      profile.createdAt = new Date(Date.now() - (globalCounter * 60000));
      profile.description = `${bio} Available in ${area}, ${city.name} (${city.state}) with direct WhatsApp and Call (+91 6351615378). 100% verified 18+ independent profile.`;
      profile.tags = ['Verified 18+', cat.name, area, 'Direct Contact', 'Discreet'];
      profile.seoTitle = `${chosenName} - 18+ Verified ${cat.name} in ${city.name}`.slice(0, 70);
      profile.seoDescription = `Connect directly with ${chosenName} in ${area}, ${city.name}. Genuine photos and direct contact on WhatsApp 6351615378.`.slice(0, 170);
      await profile.save();
      totalProfilesUpdated++;

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
        alt: `${chosenName} in ${area}, ${city.name}`,
        isMain: true,
        sortOrder: 0
      });
      totalImagesUpdated++;

      globalCounter++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: Globally Unique Photo & Profile Distribution!`);
  console.log(`✓ Total Cities: ${cities.length}`);
  console.log(`✓ Total Profiles Configured: ${totalProfilesUpdated}`);
  console.log(`✓ Total Images Configured: ${totalImagesUpdated}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

distributeGlobalUnique().catch((err) => {
  console.error('Error distributing photos:', err);
  process.exit(1);
});

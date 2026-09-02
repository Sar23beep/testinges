const mongoose = require('mongoose');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
require('dotenv').config();

const firstNames = [
  'Aarohi', 'Priya', 'Tanya', 'Maya', 'Kiara', 'Naina', 'Riya', 'Ananya', 
  'Simran', 'Pooja', 'Neha', 'Sneha', 'Shreya', 'Divya', 'Aisha', 'Muskan', 
  'Natasha', 'Alisha', 'Ritu', 'Meera', 'Sanya', 'Tanvi', 'Payal', 'Sonam', 
  'Karishma', 'Kriti', 'Avantika', 'Radhika', 'Isha', 'Trisha', 'Kavya', 
  'Anushka', 'Roshni', 'Aditi', 'Nikita', 'Jhanvi', 'Khushi', 'Rupali',
  'Sonali', 'Sheetal', 'Poonam', 'Deepika', 'Kajal', 'Anjali', 'Swati', 'Rekha',
  'Tara', 'Ishani', 'Diya', 'Bhavna', 'Reena', 'Monika', 'Sunita', 'Geeta'
];

const availableImages = [
  'profile-photo-1.jpeg',
  'profile-photo-2.jpeg',
  'profile-photo-3.jpeg',
  'profile-photo-4.jpeg',
  'profile-photo-5.jpeg',
  'profile-photo-6.jpeg',
  'profile-photo-7.jpeg',
  'profile-photo-8.jpeg',
  'profile-photo-9.jpeg',
  'profile-photo-10.jpeg',
  'profile-photo-11.jpeg',
  'profile-photo-12.jpeg',
  'profile-photo-13.jpeg',
  'profile-photo-14.jpeg',
  'profile-photo-15.jpeg',
  'profile-photo-16.jpeg',
  'profile-photo-17.jpeg',
  'profile-photo-18.jpeg',
  'profile-photo-19.jpeg',
  'profile-photo-20.jpeg',
  'profile-photo-21.jpeg',
  'profile-photo-22.jpeg',
  'profile-photo-23.jpeg',
  'profile-photo-24.jpeg'
];

const badges = ['NORMAL', 'HOT', 'VIP', 'VVIP'];
const availabilities = ['Flexible', 'Daytime', 'Evening', 'Night'];

function makeValidSlug(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fixUniqueProfiles() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const categories = await Category.find({ active: true });
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Processing ${cities.length} cities...`);

  let totalUpdatedProfiles = 0;
  let totalUpdatedImages = 0;

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    const profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });
    if (!profiles.length) continue;

    // Shift offset per city so different cities have different starting photos/names
    const nameOffset = (cIdx * 7) % firstNames.length;
    const imgOffset = (cIdx * 5) % availableImages.length;

    const usedNamesInCity = new Set();
    const usedImagesInCity = new Set();

    for (let pIdx = 0; pIdx < profiles.length; pIdx++) {
      const profile = profiles[pIdx];

      // 1. Assign unique name in this city
      let nIdx = (nameOffset + pIdx) % firstNames.length;
      while (usedNamesInCity.has(firstNames[nIdx])) {
        nIdx = (nIdx + 1) % firstNames.length;
      }
      const uniqueName = firstNames[nIdx];
      usedNamesInCity.add(uniqueName);

      // Category & Badge
      const cat = categories[(cIdx + pIdx) % categories.length];
      const badge = badges[(cIdx + pIdx) % badges.length];
      const availability = availabilities[(cIdx + pIdx) % availabilities.length];
      const age = 21 + ((cIdx + pIdx) % 10);
      const height = 158 + ((cIdx * 2 + pIdx * 3) % 18);

      const area = profile.area || (city.areas && city.areas[pIdx % city.areas.length]) || `${city.name} Centre`;
      const areaSlug = makeValidSlug(area);
      let newSlug = `${makeValidSlug(uniqueName)}-${city.slug}-${areaSlug}-${pIdx + 1}`.slice(0, 75).replace(/-+$/, '');
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(newSlug)) {
        newSlug = `${makeValidSlug(uniqueName)}-${city.slug.slice(0, 20)}-${pIdx + 1}`;
      }

      // Update Profile
      profile.name = uniqueName;
      profile.slug = newSlug;
      profile.category = cat._id;
      profile.badge = badge;
      profile.availability = availability;
      profile.displayAge = age;
      profile.heightCm = height;
      profile.area = area;
      profile.whatsapp = '916351615378';
      profile.phone = '6351615378';
      profile.description = `Independent 18+ verified companion ${uniqueName} available in ${area}, ${city.name} (${city.state}). Direct WhatsApp contact, discreet hospitality, and verified identity.`;
      profile.seoTitle = `${uniqueName} - Verified ${cat.name} in ${city.name}`.slice(0, 70);
      profile.seoDescription = `Connect with ${uniqueName} in ${area}, ${city.name}. Genuine verified companion profile with direct WhatsApp contact.`.slice(0, 170);
      await profile.save();
      totalUpdatedProfiles++;

      // 2. Assign unique image(s) for this profile in this city
      // Delete existing profile images for clean reassignment
      await ProfileImage.deleteMany({ profile: profile._id });

      // Pick 1-2 distinct photos that haven't been used yet in this city
      let img1Index = (imgOffset + pIdx * 2) % availableImages.length;
      let safetyCounter = 0;
      while (usedImagesInCity.has(availableImages[img1Index]) && safetyCounter < availableImages.length) {
        img1Index = (img1Index + 1) % availableImages.length;
        safetyCounter++;
      }
      const chosenPhoto1 = availableImages[img1Index];
      usedImagesInCity.add(chosenPhoto1);

      // Create main image
      const publicId1 = `img-${profile.slug}-1`;
      await ProfileImage.create({
        profile: profile._id,
        url: `/images/profiles/${chosenPhoto1}`,
        publicId: publicId1,
        width: 800,
        height: 1000,
        format: 'jpeg',
        alt: `${profile.name} in ${area}, ${city.name}`,
        isMain: true,
        sortOrder: 0
      });
      totalUpdatedImages++;

      // Optionally pick a second distinct photo if available
      let img2Index = (img1Index + 1) % availableImages.length;
      let safetyCounter2 = 0;
      while (usedImagesInCity.has(availableImages[img2Index]) && safetyCounter2 < availableImages.length) {
        img2Index = (img2Index + 1) % availableImages.length;
        safetyCounter2++;
      }
      if (!usedImagesInCity.has(availableImages[img2Index])) {
        const chosenPhoto2 = availableImages[img2Index];
        usedImagesInCity.add(chosenPhoto2);

        const publicId2 = `img-${profile.slug}-2`;
        await ProfileImage.create({
          profile: profile._id,
          url: `/images/profiles/${chosenPhoto2}`,
          publicId: publicId2,
          width: 800,
          height: 1000,
          format: 'jpeg',
          alt: `${profile.name} photo 2 in ${area}, ${city.name}`,
          isMain: false,
          sortOrder: 1
        });
        totalUpdatedImages++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: Cleaned and updated all city profiles!`);
  console.log(`✓ Total Cities: ${cities.length}`);
  console.log(`✓ Total Profiles Updated (Unique per city): ${totalUpdatedProfiles}`);
  console.log(`✓ Total Profile Images Linked: ${totalUpdatedImages}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

fixUniqueProfiles().catch((err) => {
  console.error('Error fixing profiles:', err);
  process.exit(1);
});

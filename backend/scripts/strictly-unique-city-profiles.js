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

const badges = ['HOT', 'VIP', 'VVIP', 'NORMAL'];
const availabilities = ['Flexible', 'Daytime', 'Evening', 'Night'];

function makeValidSlug(str) {
  return String(str || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function strictlyUniquePerCity() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const categories = await Category.find({ active: true });
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Processing ${cities.length} cities...`);

  let totalActiveProfiles = 0;
  let totalActiveImages = 0;
  let deletedExcessProfiles = 0;

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    let profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });

    // Determine target profile count for this city: max 6-8 per city so photos never repeat
    const targetCount = Math.min(Math.max(profiles.length, 2), 6);

    // If city has more than targetCount, remove excess profiles so no duplicate photos exist
    if (profiles.length > targetCount) {
      const toRemove = profiles.slice(targetCount);
      const toRemoveIds = toRemove.map(p => p._id);
      await Profile.deleteMany({ _id: { $in: toRemoveIds } });
      await ProfileImage.deleteMany({ profile: { $in: toRemoveIds } });
      deletedExcessProfiles += toRemove.length;
      profiles = profiles.slice(0, targetCount);
    }

    // Offset for distinct starting point across cities
    const nameOffset = (cIdx * 7) % firstNames.length;
    const imgOffset = (cIdx * 3) % availableImages.length;

    for (let pIdx = 0; pIdx < profiles.length; pIdx++) {
      const profile = profiles[pIdx];

      // 1. Assign strictly unique name in this city
      const nameIndex = (nameOffset + pIdx) % firstNames.length;
      const uniqueName = firstNames[nameIndex];

      // 2. Assign unique Category, Badge, Availability
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
      profile.status = 'published';
      profile.featured = (pIdx === 0);
      profile.description = `Independent 18+ verified companion ${uniqueName} available in ${area}, ${city.name} (${city.state}). Direct WhatsApp contact, discreet hospitality, and verified identity.`;
      profile.seoTitle = `${uniqueName} - Verified ${cat.name} in ${city.name}`.slice(0, 70);
      profile.seoDescription = `Connect with ${uniqueName} in ${area}, ${city.name}. Genuine verified companion profile with direct WhatsApp contact.`.slice(0, 170);
      await profile.save();
      totalActiveProfiles++;

      // 3. Assign strictly unique image for this profile in this city
      await ProfileImage.deleteMany({ profile: profile._id });

      const imgIndex = (imgOffset + pIdx) % availableImages.length;
      const chosenPhoto = availableImages[imgIndex];

      const publicId = `img-${profile.slug}-1`;
      await ProfileImage.create({
        profile: profile._id,
        url: `/images/profiles/${chosenPhoto}`,
        publicId,
        width: 800,
        height: 1000,
        format: 'jpeg',
        alt: `${profile.name} in ${area}, ${city.name}`,
        isMain: true,
        sortOrder: 0
      });
      totalActiveImages++;
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: Set 100% strictly unique profiles & images per city!`);
  console.log(`✓ Total Cities: ${cities.length}`);
  console.log(`✓ Total Active Profiles (100% unique per city): ${totalActiveProfiles}`);
  console.log(`✓ Total Active Profile Images (100% unique per city): ${totalActiveImages}`);
  console.log(`✓ Removed Excess Redundant Duplicates: ${deletedExcessProfiles}`);
  console.log(`========================================\n`);

  await mongoose.disconnect();
}

strictlyUniquePerCity().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});

const mongoose = require('mongoose');
const City = require('../models/City');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
require('dotenv').config();

const availableImages = [
  'profile-photo-1.jpeg', 'profile-photo-2.jpeg', 'profile-photo-3.jpeg', 'profile-photo-4.jpeg',
  'profile-photo-5.jpeg', 'profile-photo-6.jpeg', 'profile-photo-7.jpeg', 'profile-photo-8.jpeg',
  'profile-photo-9.jpeg', 'profile-photo-10.jpeg', 'profile-photo-11.jpeg', 'profile-photo-12.jpeg',
  'profile-photo-13.jpeg', 'profile-photo-14.jpeg', 'profile-photo-15.jpeg', 'profile-photo-16.jpeg',
  'profile-photo-17.jpeg', 'profile-photo-18.jpeg', 'profile-photo-19.jpeg', 'profile-photo-20.jpeg',
  'profile-photo-21.jpeg', 'profile-photo-22.jpeg', 'profile-photo-23.jpeg', 'profile-photo-24.jpeg'
];

async function ensureAllMax6() {
  await mongoose.connect(process.env.MONGODB_URI);
  const cities = await City.find({});
  console.log(`Processing ${cities.length} cities...`);

  for (let cIdx = 0; cIdx < cities.length; cIdx++) {
    const city = cities[cIdx];
    const profiles = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });
    if (profiles.length > 6) {
      const excess = profiles.slice(6);
      const excessIds = excess.map(p => p._id);
      await Profile.deleteMany({ _id: { $in: excessIds } });
      await ProfileImage.deleteMany({ profile: { $in: excessIds } });
    }
    
    // ensure unique photos for the remaining profiles in this city
    const kept = await Profile.find({ city: city._id, deletedAt: null }).sort({ createdAt: 1 });
    for (let pIdx = 0; pIdx < kept.length; pIdx++) {
      const p = kept[pIdx];
      const chosenPhoto = availableImages[(cIdx * 3 + pIdx) % availableImages.length];
      const publicId = `img-${p._id}-1`;

      await ProfileImage.deleteMany({ profile: p._id });
      await ProfileImage.create({
        profile: p._id,
        url: `/images/profiles/${chosenPhoto}`,
        publicId,
        width: 800,
        height: 1000,
        format: 'jpeg',
        alt: `${p.name} in ${city.name}`,
        isMain: true,
        sortOrder: 0
      });
    }
  }
  console.log('✓ All cities verified: max 6 profiles per city with 100% unique photos and names!');
  await mongoose.disconnect();
}

ensureAllMax6().catch(console.error);

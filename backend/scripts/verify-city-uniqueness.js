const mongoose = require('mongoose');
const City = require('../models/City');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
require('dotenv').config();

async function verifyCityUniqueness() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('--- VERIFYING UNIQUE PROFILES & IMAGES PER CITY ---');

  const testCities = ['Jaipur', 'Delhi', 'Mumbai', 'Udaipur', 'Ahmedabad', 'Surat', 'Bangalore', 'Kolkata', 'Pune', 'Hyderabad', 'Rohini Sector 17', 'Film Nagar'];

  for (const name of testCities) {
    const city = await City.findOne({ name: new RegExp('^' + name + '$', 'i') });
    if (!city) {
      console.log(`City not found: ${name}`);
      continue;
    }

    const profiles = await Profile.find({ city: city._id, deletedAt: null });
    const names = profiles.map(p => p.name);
    const hasDuplicateName = new Set(names).size !== names.length;

    const profileIds = profiles.map(p => p._id);
    const images = await ProfileImage.find({ profile: { $in: profileIds }, isMain: true });
    const imgUrls = images.map(i => i.url);
    const hasDuplicateImage = new Set(imgUrls).size !== imgUrls.length;

    console.log(`City: ${city.name.padEnd(18)} | Profiles: ${profiles.length} | Unique Names: ${!hasDuplicateName ? '✓ YES' : '✗ DUPLICATE'} | Unique Photos: ${!hasDuplicateImage ? '✓ YES' : '✗ DUPLICATE'}`);
    console.log(`  -> Names in ${city.name}: [${names.slice(0, 5).join(', ')}${names.length > 5 ? ', ...' : ''}]`);
    console.log(`  -> Photos in ${city.name}: [${imgUrls.slice(0, 5).map(u => u.split('/').pop()).join(', ')}${imgUrls.length > 5 ? ', ...' : ''}]`);
  }

  await mongoose.disconnect();
}

verifyCityUniqueness().catch(console.error);

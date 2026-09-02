const mongoose = require('mongoose');
const City = require('../models/City');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
require('dotenv').config();

async function verify() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const totalCities = await City.countDocuments();
  const totalProfiles = await Profile.countDocuments({ deletedAt: null, status: 'published' });
  const totalImages = await ProfileImage.countDocuments();
  
  console.log('--- DATABASE VERIFICATION ---');
  console.log('Total Cities in DB:', totalCities);
  console.log('Total Published Profiles:', totalProfiles);
  console.log('Total Profile Images:', totalImages);
  
  // Sample check on cities with profiles
  const sampleCityNames = ['Jaipur', 'Udaipur', 'Ahmedabad', 'Surat', 'Film Nagar', 'Rohini Sector 17', 'Varanasi', 'Kolkata', 'Pune'];
  for (const cName of sampleCityNames) {
    const city = await City.findOne({ name: new RegExp('^' + cName + '$', 'i') });
    if (city) {
      const pCount = await Profile.countDocuments({ city: city._id });
      console.log(`✓ City: ${city.name} | Slug: ${city.slug} | State: ${city.state} | Profiles: ${pCount}`);
    } else {
      console.log(`✗ Not found: ${cName}`);
    }
  }

  // Check profiles with image count
  const sampleProfiles = await Profile.find({ status: 'published' }).limit(5).populate('city');
  for (const p of sampleProfiles) {
    const imgCount = await ProfileImage.countDocuments({ profile: p._id });
    console.log(`✓ Profile: ${p.name} | City: ${p.city ? p.city.name : 'N/A'} | Images: ${imgCount} | Badge: ${p.badge}`);
  }
  
  await mongoose.disconnect();
}

verify().catch(console.error);

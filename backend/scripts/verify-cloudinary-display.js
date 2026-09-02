const mongoose = require('mongoose');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
const City = require('../models/City');
require('dotenv').config();

async function testCloudinaryDisplay() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('--- VERIFYING CLOUDINARY INTEGRATION ---');

  const homeProfiles = await Profile.find({ status: 'published', deletedAt: null }).sort({ featured: -1, createdAt: -1 }).limit(10).populate('city');
  console.log('\nHome Page Top 10 Profiles:');
  const homePhotos = [];
  for (const p of homeProfiles) {
    const img = await ProfileImage.findOne({ profile: p._id, isMain: true });
    homePhotos.push(img ? img.url : 'none');
    console.log(` - ${p.name.padEnd(10)} | City: ${(p.city ? p.city.name : '').padEnd(16)} | Image: ${img ? img.url : 'none'}`);
  }
  const isHomeUnique = new Set(homePhotos).size === homePhotos.length;
  console.log(`\n✓ Home Page Top 10 Images are 100% Unique: ${isHomeUnique ? 'YES' : 'NO'}`);

  const cldCount = await ProfileImage.countDocuments({ url: /res\.cloudinary\.com/ });
  console.log(`✓ Total Cloudinary Images in Database: ${cldCount}`);

  await mongoose.disconnect();
}

testCloudinaryDisplay().catch(console.error);

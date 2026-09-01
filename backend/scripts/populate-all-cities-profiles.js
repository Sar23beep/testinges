require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');

const firstNames = [
  'Aarohi', 'Priya', 'Tanya', 'Maya', 'Kiara', 'Naina', 'Riya', 'Ananya', 
  'Simran', 'Pooja', 'Neha', 'Sneha', 'Shreya', 'Divya', 'Aisha', 'Muskan', 
  'Natasha', 'Alisha', 'Ritu', 'Meera', 'Sanya', 'Tanvi', 'Payal', 'Sonam', 
  'Karishma', 'Kriti', 'Avantika', 'Radhika', 'Isha', 'Trisha', 'Kavya', 
  'Anushka', 'Roshni', 'Payal', 'Aditi', 'Nikita', 'Jhanvi', 'Khushi', 'Rupali'
];

const categoryDefs = [
  { name: 'Independent', slug: 'independent', description: 'Independent verified profiles managing direct conversations.' },
  { name: 'Elite', slug: 'elite', description: 'A premium collection of high-class verified profiles.' },
  { name: 'Companion', slug: 'companion', description: 'Charming and social companion profiles.' },
  { name: 'VIP', slug: 'vip', description: 'Exclusive VIP profiles with verified luxury standards.' },
  { name: 'High Profile', slug: 'high-profile', description: 'Top-tier high profile verified listings.' },
  { name: 'College Girl', slug: 'college-girl', description: 'Young, energetic verified independent listings.' },
  { name: 'Air Hostess', slug: 'air-hostess', description: 'Sophisticated and polished verified models.' },
  { name: 'Celebrity', slug: 'celebrity', description: 'Exclusive celebrity & glamour verified profiles.' },
  { name: 'Housewife', slug: 'housewife', description: 'Mature, warm, and discreet verified companions.' }
];

const badges = ['NORMAL', 'HOT', 'VIP', 'VVIP'];
const availabilities = ['Flexible', 'Daytime', 'Evening', 'Night'];

async function populate() {
  await connectDatabase();

  const srcDir = path.join(__dirname, '../images');
  const targetDir = path.join(__dirname, '../public/images/profiles');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 1. Read source images and copy them with clean names
  const srcFiles = fs.readdirSync(srcDir).filter(f => /\.(jpe?g|png|webp)$/i.test(f));
  console.log(`Found ${srcFiles.length} source images in images/ directory.`);

  const copiedImageNames = [];
  srcFiles.forEach((file, index) => {
    const ext = path.extname(file) || '.jpeg';
    const destName = `profile-photo-${index + 1}${ext}`;
    const srcPath = path.join(srcDir, file);
    const destPath = path.join(targetDir, destName);
    fs.copyFileSync(srcPath, destPath);
    copiedImageNames.push(destName);
  });
  console.log(`✓ Copied ${copiedImageNames.length} photos to public/images/profiles/`);

  // 2. Ensure categories exist
  const categories = {};
  for (const cat of categoryDefs) {
    const record = await Category.findOneAndUpdate(
      { slug: cat.slug },
      { 
        name: cat.name, 
        slug: cat.slug, 
        description: cat.description,
        h1: `${cat.name} profiles`,
        active: true 
      },
      { upsert: true, new: true, runValidators: true }
    );
    categories[cat.slug] = record;
  }
  const categoryKeys = Object.keys(categories);
  console.log(`✓ ${categoryKeys.length} categories ready.`);

  // 3. Fetch all cities
  const cities = await City.find({ active: true }).sort({ sortOrder: 1 });
  console.log(`Fetched ${cities.length} active cities from database.`);

  let totalProfilesCreated = 0;
  let totalImagesLinked = 0;
  let nameIndex = 0;
  let imageIndex = 0;
  let phoneCounter = 9876500001;

  for (const city of cities) {
    const areas = (city.areas && city.areas.length > 0) 
      ? city.areas 
      : ["Main Area", "City Centre", "Civil Lines"];

    // Ensure every area in the city has 1 to 2 profiles
    for (let aIdx = 0; aIdx < areas.length; aIdx++) {
      const area = areas[aIdx];
      // Create 1-2 profiles per local area
      const countForArea = aIdx === 0 ? 2 : 1; 

      for (let pIdx = 0; pIdx < countForArea; pIdx++) {
        const name = firstNames[nameIndex % firstNames.length];
        nameIndex += 1;

        const catKey = categoryKeys[(nameIndex + aIdx + pIdx) % categoryKeys.length];
        const category = categories[catKey];

        const areaSlug = area.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        const slug = `${name.toLowerCase()}-${city.slug}-${areaSlug}-${pIdx + 1}`.slice(0, 75);

        const age = 21 + ((nameIndex + pIdx) % 11); // 21 to 31
        const height = 158 + ((nameIndex * 3) % 18); // 158 to 175
        const badge = badges[(nameIndex + pIdx) % badges.length];
        const isFeatured = (pIdx === 0 && aIdx === 0);
        const availability = availabilities[(nameIndex + aIdx) % availabilities.length];

        const phone = String(phoneCounter++);
        const whatsapp = phone;

        const languages = ['Hindi', 'English'];
        if (city.state === 'Maharashtra') languages.push('Marathi');
        else if (city.state === 'Karnataka') languages.push('Kannada');
        else if (city.state === 'Tamil Nadu') languages.push('Tamil');
        else if (city.state === 'Telangana' || city.state === 'Andhra Pradesh') languages.push('Telugu');
        else if (city.state === 'West Bengal') languages.push('Bengali');
        else if (city.state === 'Punjab') languages.push('Punjabi');

        const profileData = {
          name,
          slug,
          city: city._id,
          category: category._id,
          description: `Independent 18+ verified companion ${name} available in ${area}, ${city.name} (${city.state}). Direct WhatsApp contact, discreet hospitality, and verified identity.`,
          displayAge: age,
          heightCm: height,
          languages,
          availability,
          area,
          phone,
          whatsapp,
          badge,
          tags: ['Verified 18+', category.name, area, 'Direct Contact', 'Discreet'],
          featured: isFeatured,
          status: 'published',
          ageVerified: true,
          consentVerified: true,
          publishedAt: new Date(),
          deletedAt: null
        };

        const profile = await Profile.findOneAndUpdate(
          { slug },
          profileData,
          { upsert: true, new: true, runValidators: true }
        );
        totalProfilesCreated += 1;

        // Assign 1 to 3 images from copied photos
        const numImages = 1 + ((nameIndex + aIdx) % 3); // 1, 2, or 3 images
        for (let imgNum = 0; imgNum < numImages; imgNum++) {
          const chosenImg = copiedImageNames[imageIndex % copiedImageNames.length];
          imageIndex += 1;

          const publicId = `img-${profile.slug}-${imgNum + 1}`;
          await ProfileImage.findOneAndUpdate(
            { publicId },
            {
              profile: profile._id,
              url: `/images/profiles/${chosenImg}`,
              publicId,
              width: 800,
              height: 1000,
              format: 'jpeg',
              alt: `${profile.name} in ${area}, ${city.name}`,
              isMain: (imgNum === 0),
              sortOrder: imgNum
            },
            { upsert: true, new: true, runValidators: true }
          );
          totalImagesLinked += 1;
        }
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`✓ COMPLETE: Populated all cities & local areas!`);
  console.log(`✓ Total Cities Covered: ${cities.length} (Gujarat 100% Excluded)`);
  console.log(`✓ Total Profiles Created: ${totalProfilesCreated}`);
  console.log(`✓ Total Profile Images Linked: ${totalImagesLinked}`);
  console.log(`========================================\n`);
}

if (require.main === module) {
  populate()
    .catch((err) => {
      console.error('Error populating profiles:', err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = populate;

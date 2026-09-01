require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');

const profiles = [
  { name: 'Aarohi', slug: 'demo-aarohi', city: 'mumbai', category: 'independent', badge: 'VVIP', featured: true, image: 'profile-emerald.webp', age: 27, height: 167, area: 'Bandra West', availability: 'Evening', languages: ['Hindi', 'English'], tags: ['Verified 18+', 'Independent', 'Evening'] },
  { name: 'Maya', slug: 'demo-maya', city: 'delhi', category: 'elite', badge: 'VIP', featured: true, image: 'profile-noir.webp', age: 30, height: 170, area: 'South Delhi', availability: 'Flexible', languages: ['Hindi', 'English'], tags: ['Verified 18+', 'Elite', 'Discreet'] },
  { name: 'Rhea', slug: 'demo-rhea', city: 'bangalore', category: 'companion', badge: 'HOT', featured: true, image: 'profile-burgundy.webp', age: 28, height: 165, area: 'Indiranagar', availability: 'Night', languages: ['English', 'Hindi', 'Kannada'], tags: ['Verified 18+', 'Companion', 'Social'] },
  { name: 'Zara', slug: 'demo-zara', city: 'mumbai', category: 'elite', badge: 'VIP', featured: false, image: 'profile-noir.webp', age: 29, height: 168, area: 'Andheri West', availability: 'Flexible', languages: ['Hindi', 'English'], tags: ['Verified 18+', 'Elite', 'Nightlife'] },
  { name: 'Kiara', slug: 'demo-kiara', city: 'delhi', category: 'independent', badge: 'HOT', featured: false, image: 'profile-burgundy.webp', age: 26, height: 164, area: 'Aerocity', availability: 'Evening', languages: ['Hindi', 'English'], tags: ['Verified 18+', 'Independent', 'Premium'] },
  { name: 'Naina', slug: 'demo-naina', city: 'bangalore', category: 'elite', badge: 'NORMAL', featured: false, image: 'profile-emerald.webp', age: 31, height: 169, area: 'Koramangala', availability: 'Daytime', languages: ['English', 'Hindi'], tags: ['Verified 18+', 'Elite', 'Private'] }
];

async function run() {
  if (process.env.ALLOW_DEMO_SEED !== 'true') throw new Error('Set ALLOW_DEMO_SEED=true to insert clearly marked fictional demo records.');
  await connectDatabase();
  const cityRows = [
    ['Mumbai', 'mumbai', 'Explore verified adult profiles across Mumbai with privacy-first direct contact.'],
    ['Delhi', 'delhi', 'Discover premium verified adult profiles available across Delhi.'],
    ['Bangalore', 'bangalore', 'Browse independent verified adult profiles in Bangalore.']
  ];
  const categoryRows = [
    ['Independent', 'independent', 'Independent adult profiles managing their own direct conversations.'],
    ['Elite', 'elite', 'A premium collection of polished, verified adult profiles.'],
    ['Companion', 'companion', 'Social adult profiles for direct independent connection.']
  ];
  const cities = {};
  const categories = {};
  for (const [name, slug, description] of cityRows) cities[slug] = await City.findOneAndUpdate({ slug }, { name, slug, description, h1: `Verified adult profiles in ${name}`, active: true }, { upsert: true, new: true, runValidators: true });
  for (const [name, slug, description] of categoryRows) categories[slug] = await Category.findOneAndUpdate({ slug }, { name, slug, description, h1: `${name} adult profiles`, active: true }, { upsert: true, new: true, runValidators: true });

  for (let index = 0; index < profiles.length; index += 1) {
    const item = profiles[index];
    const profile = await Profile.findOneAndUpdate({ slug: item.slug }, {
      name: item.name, slug: item.slug, city: cities[item.city]._id, category: categories[item.category]._id,
      description: `Fictional 18+ demo profile for design preview only. ${item.name} represents a privacy-conscious, independently managed profile. No real person or service is advertised.`,
      displayAge: item.age, heightCm: item.height, area: item.area, availability: item.availability, languages: item.languages,
      whatsapp: `9190000000${index + 1}`, badge: item.badge, featured: item.featured, status: 'published',
      ageVerified: true, consentVerified: true, tags: item.tags, publishedAt: new Date(), deletedAt: null
    }, { upsert: true, new: true, runValidators: true });
    await ProfileImage.findOneAndUpdate({ publicId: `local-demo/${item.slug}` }, {
      profile: profile._id, url: `/images/demo/${item.image}`, publicId: `local-demo/${item.slug}`,
      width: 900, height: 1124, format: 'webp', alt: `${item.name} fictional demo portrait`, isMain: true, sortOrder: 0
    }, { upsert: true, new: true, runValidators: true });
  }
  console.log('Inserted 3 cities, 3 categories, 6 fictional adult demo profiles, and local generated demo images.');
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

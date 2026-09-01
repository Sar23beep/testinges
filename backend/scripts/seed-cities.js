require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const City = require('../models/City');
const citiesData = require('../data/indian-cities.json');

async function seedCities() {
  await connectDatabase();
  console.log(`Starting to seed ${citiesData.length} Indian cities (Gujarat excluded)...`);

  let added = 0;
  let updated = 0;

  for (const item of citiesData) {
    const existing = await City.findOne({ slug: item.slug });
    const updateData = {
      name: item.name,
      slug: item.slug,
      state: item.state,
      tier: item.tier,
      sortOrder: item.sortOrder,
      active: item.active !== false,
      h1: `Verified adult profiles in ${item.name}`,
      seoTitle: `Profiles in ${item.name}, ${item.state} | Veloura`.slice(0, 110),
      seoDescription: `Discover verified and independent profiles in ${item.name}, ${item.state}. Browse genuine listings with direct contact.`
    };

    if (existing) {
      await City.updateOne({ _id: existing._id }, { $set: updateData });
      updated += 1;
    } else {
      await City.create({
        ...updateData,
        description: `Explore verified adult profiles across ${item.name} (${item.state}) with privacy-first direct contact.`
      });
      added += 1;
    }
  }

  // Remove any Gujarat cities if present in database
  const gujaratSlugs = [
    'ahmedabad', 'surat', 'vadodara', 'rajkot', 'gandhinagar', 'bhavnagar', 
    'jamnagar', 'junagadh', 'anand', 'navsari', 'morbi', 'bharuch', 
    'porbandar', 'vapi', 'valsad', 'bhuj', 'mehsana', 'ankleshwar'
  ];
  const deleteResult = await City.deleteMany({
    $or: [
      { slug: { $in: gujaratSlugs } },
      { state: { $regex: /^gujarat$/i } }
    ]
  });

  if (deleteResult.deletedCount > 0) {
    console.log(`Removed ${deleteResult.deletedCount} Gujarat cities from database.`);
  }

  console.log(`✓ City Seeding Complete: ${added} added, ${updated} updated, Total in DB: ${await City.countDocuments()}`);
}

if (require.main === module) {
  seedCities()
    .catch((err) => {
      console.error('Error seeding cities:', err);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = seedCities;

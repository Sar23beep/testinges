const { cloudinary } = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function checkCloudinary() {
  console.log('Checking Cloudinary credentials:');
  console.log('Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
  console.log('API Key:', process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing');

  try {
    const result = await cloudinary.api.ping();
    console.log('✓ Cloudinary Ping successful:', result);

    // List existing resources in Cloudinary
    const resources = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'veloura',
      max_results: 30
    });
    console.log(`Found ${resources.resources.length} existing images in Cloudinary (prefix: veloura):`);
    resources.resources.forEach(r => console.log(' -', r.public_id, '->', r.secure_url));
  } catch (err) {
    console.error('Cloudinary Error:', err.message);
  }
}

checkCloudinary();

const mongoose = require('mongoose');
require('dotenv').config();
const Profile = require('../models/Profile');

async function updateWhatsAppNumber() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const result = await Profile.updateMany(
    {},
    {
      $set: {
        whatsapp: '916351615378',
        phone: '6351615378'
      }
    }
  );

  console.log(`✓ Updated ${result.modifiedCount} profiles with WhatsApp: 916351615378 and Phone: 6351615378`);
  await mongoose.disconnect();
}

updateWhatsAppNumber().catch((err) => {
  console.error(err);
  process.exit(1);
});

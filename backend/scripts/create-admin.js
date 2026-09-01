require('dotenv').config();
const mongoose = require('mongoose');
const connectDatabase = require('../config/db');
const Admin = require('../models/Admin');

async function run() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email || password.length < 10) throw new Error('Set ADMIN_EMAIL and an ADMIN_PASSWORD of at least 10 characters. A 12+ character password is recommended.');
  await connectDatabase();
  const passwordHash = await Admin.hashPassword(password);
  await Admin.findOneAndUpdate({ email }, { name: 'Administrator', email, passwordHash, role: 'admin', active: true }, { upsert: true, runValidators: true });
  console.log(`Admin account ready: ${email}`);
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => mongoose.disconnect());

const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const OLD_MONGO_URI = process.env.OLD_MONGODB_URI;
const NEW_MONGO_URI = process.env.MONGODB_URI;

const OLD_CLOUDINARY = {
  cloud_name: process.env.OLD_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.OLD_CLOUDINARY_API_KEY,
  api_secret: process.env.OLD_CLOUDINARY_API_SECRET
};

const NEW_CLOUDINARY = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
};

async function migrateCloudinary() {
  console.log('==============================================');
  console.log('STEP 1: MIGRATING CLOUDINARY ASSETS');
  console.log('==============================================');

  // Instance for old Cloudinary
  const oldCld = cloudinary;
  oldCld.config(OLD_CLOUDINARY);

  let nextCursor = null;
  const oldResources = [];
  do {
    const res = await oldCld.api.resources({
      type: 'upload',
      prefix: 'veloura/profiles',
      max_results: 500,
      next_cursor: nextCursor
    });
    oldResources.push(...res.resources);
    nextCursor = res.next_cursor;
  } while (nextCursor);

  console.log(`Found ${oldResources.length} assets in Old Cloudinary (veloura/profiles).`);

  // Switch to new Cloudinary
  const newCld = cloudinary;
  newCld.config(NEW_CLOUDINARY);

  const urlMap = new Map();

  for (let i = 0; i < oldResources.length; i++) {
    const r = oldResources[i];
    const filename = r.public_id.replace('veloura/profiles/', '');
    process.stdout.write(`[${i + 1}/${oldResources.length}] Uploading ${filename} to new Cloudinary... `);

    try {
      const uploadRes = await newCld.uploader.upload(r.secure_url, {
        folder: 'veloura/profiles',
        public_id: filename,
        overwrite: true,
        resource_type: 'image'
      });

      urlMap.set(r.secure_url, uploadRes.secure_url);
      urlMap.set(r.url, uploadRes.secure_url);

      // Also map non-versioned or variations
      const oldBase = `https://res.cloudinary.com/${OLD_CLOUDINARY.cloud_name}/image/upload/`;
      const newBase = `https://res.cloudinary.com/${NEW_CLOUDINARY.cloud_name}/image/upload/`;
      urlMap.set(r.public_id, uploadRes.public_id);

      console.log('DONE -> ' + uploadRes.secure_url);
    } catch (err) {
      console.error('FAILED:', err.message);
    }
  }

  console.log(`Successfully mapped ${urlMap.size} asset URL references.`);
  return urlMap;
}

function mapCloudinaryUrl(url, urlMap) {
  if (!url || typeof url !== 'string') return url;
  if (urlMap.has(url)) return urlMap.get(url);

  // Fallback pattern match if exact version mismatch
  if (url.includes(`res.cloudinary.com/${OLD_CLOUDINARY.cloud_name}`)) {
    return url.replace(
      new RegExp(`res\\.cloudinary\\.com/${OLD_CLOUDINARY.cloud_name}`, 'g'),
      `res.cloudinary.com/${NEW_CLOUDINARY.cloud_name}`
    );
  }
  return url;
}

async function migrateMongo(urlMap) {
  console.log('\n==============================================');
  console.log('STEP 2: MIGRATING MONGODB COLLECTIONS');
  console.log('==============================================');

  console.log('Connecting to Old MongoDB:', OLD_MONGO_URI);
  const oldConn = await mongoose.createConnection(OLD_MONGO_URI).asPromise();
  console.log('Connecting to New MongoDB:', NEW_MONGO_URI);
  const newConn = await mongoose.createConnection(NEW_MONGO_URI).asPromise();

  const collections = await oldConn.db.listCollections().toArray();
  console.log(`Found ${collections.length} collections in Old DB.`);

  for (const colInfo of collections) {
    const colName = colInfo.name;
    if (colName.startsWith('system.')) continue;

    const oldCol = oldConn.db.collection(colName);
    const newCol = newConn.db.collection(colName);

    const docCount = await oldCol.countDocuments();
    if (docCount === 0) {
      console.log(`- ${colName}: 0 documents (skipping empty collection)`);
      continue;
    }

    console.log(`- Migrating ${colName} (${docCount} documents)...`);

    // Fetch all documents
    const cursor = oldCol.find({});
    const batchSize = 500;
    let batch = [];
    let processed = 0;

    // Clear existing docs in new collection to avoid duplicate _id conflicts
    await newCol.deleteMany({});

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      // Transform URLs if in profileimages or profiles
      if (colName === 'profileimages') {
        if (doc.url) {
          doc.url = mapCloudinaryUrl(doc.url, urlMap);
        }
      } else if (colName === 'profiles') {
        if (doc.seoOgImage) {
          doc.seoOgImage = mapCloudinaryUrl(doc.seoOgImage, urlMap);
        }
      }

      batch.push(doc);

      if (batch.length >= batchSize) {
        await newCol.insertMany(batch, { ordered: false });
        processed += batch.length;
        process.stdout.write(`  Inserted ${processed}/${docCount}...\r`);
        batch = [];
      }
    }

    if (batch.length > 0) {
      await newCol.insertMany(batch, { ordered: false });
      processed += batch.length;
    }

    console.log(`  Successfully inserted ${processed}/${docCount} documents into ${colName}.`);

    // Copy indexes
    try {
      const indexes = await oldCol.indexes();
      for (const idx of indexes) {
        if (idx.name === '_id_') continue;
        const key = idx.key;
        const options = { name: idx.name };
        if (idx.unique) options.unique = true;
        if (idx.sparse) options.sparse = true;
        if (idx.background) options.background = true;
        await newCol.createIndex(key, options).catch(e => {
          // Ignore if index already exists
        });
      }
      console.log(`  Copied ${indexes.length - 1} indexes for ${colName}.`);
    } catch (idxErr) {
      console.warn(`  Warning copying indexes for ${colName}:`, idxErr.message);
    }
  }

  await oldConn.close();
  await newConn.close();
}

async function run() {
  const startTime = Date.now();
  console.log('Starting full migration at:', new Date().toISOString());

  const urlMap = await migrateCloudinary();
  await migrateMongo(urlMap);

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n==============================================');
  console.log(`MIGRATION COMPLETED IN ${durationSec}s`);
  console.log('==============================================');
}

run().catch(err => {
  console.error('Fatal Migration Error:', err);
  process.exit(1);
});

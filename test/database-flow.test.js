const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const mongoose = require('mongoose');
let MongoMemoryServer;
try {
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch {
  MongoMemoryServer = null;
}

function csrfFrom(html) {
  const match = html.match(/name="_csrf"[^>]*value="([^"]+)"/);
  assert.ok(match, `expected a CSRF token in rendered HTML: ${html.slice(0, 300)}`);
  return match[1];
}

test('admin CRUD publishes real MongoDB-backed directory pages', { timeout: 120000, skip: !MongoMemoryServer && 'Install mongodb-memory-server to run database integration checks.' }, async (t) => {
  const mongo = await MongoMemoryServer.create();
  process.env.MONGODB_URI = mongo.getUri();
  process.env.SESSION_SECRET = 'integration-secret-longer-than-thirty-two-characters';
  process.env.CLOUDINARY_CLOUD_NAME = '';
  process.env.CLOUDINARY_API_KEY = '';
  process.env.CLOUDINARY_API_SECRET = '';

  const app = require('../app');
  const connectDatabase = require('../config/db');
  const Admin = require('../models/Admin');
  const City = require('../models/City');
  const Category = require('../models/Category');
  const Profile = require('../models/Profile');
  const Report = require('../models/Report');
  await connectDatabase(process.env.MONGODB_URI);

  t.after(async () => {
    if (app.locals.sessionStore?.close) await app.locals.sessionStore.close();
    await mongoose.disconnect();
    await mongo.stop();
  });

  await Admin.create({ name: 'Test Admin', email: 'admin@test.local', passwordHash: await Admin.hashPassword('strong-test-password') });
  const agent = request.agent(app);
  let response = await agent.get('/admin/login').expect(200);
  let csrf = csrfFrom(response.text);
  await agent.post('/admin/login').type('form').send({ _csrf: csrf, email: 'admin@test.local', password: 'strong-test-password' }).expect(302).expect('Location', '/admin');

  response = await agent.get('/admin').expect(200);
  csrf = csrfFrom(response.text);
  await agent.post('/admin/cities').type('form').send({
    _csrf: csrf, name: 'Test City', slug: 'test-city',
    phone: '9876543210', whatsapp: '919876543210',
    description: 'Meaningful city copy for the integration test.', active: 'on'
  }).expect(302);
  await agent.post('/admin/categories').type('form').send({ _csrf: csrf, name: 'Test Category', slug: 'test-category', description: 'Meaningful category copy for the integration test.', active: 'on' }).expect(302);
  const [city, category] = await Promise.all([City.findOne({ slug: 'test-city' }), Category.findOne({ slug: 'test-category' })]);
  assert.ok(city && category);
  assert.equal(city.phone, '9876543210');
  assert.equal(city.whatsapp, '919876543210');

  await agent.post('/admin/profiles').type('form').send({
    _csrf: csrf, name: 'Verified Test Profile', slug: 'verified-test-profile', city: city._id.toString(), category: category._id.toString(),
    description: 'Authorized integration test profile used to verify publication and clean public routes.', whatsapp: '+91 98765 43210',
    badge: 'VVIP', featured: 'on', status: 'published', ageVerified: 'on', consentVerified: 'on'
  }).expect(302);
  const profile = await Profile.findOne({ slug: 'verified-test-profile' });
  assert.equal(profile.status, 'published');

  await agent.put(`/admin/profiles/${profile._id}`).type('form').send({
    _csrf: csrf, name: 'Updated Test Profile', slug: 'verified-test-profile', city: city._id.toString(), category: category._id.toString(),
    description: 'Updated authorized profile content used to verify the complete edit workflow.', whatsapp: '+91 98765 43210',
    badge: 'HOT', status: 'published', ageVerified: 'on', consentVerified: 'on'
  }).expect(302);
  assert.equal((await Profile.findById(profile._id)).badge, 'HOT');

  response = await agent.get('/').expect(200);
  assert.match(response.text, /Updated Test Profile/);
  assert.match(response.text, /https:\/\/wa\.me\/919876543210/);
  assert.match(response.text, /rel="canonical" href="http:\/\/127\.0\.0\.1:\d+\/"/);
  const cityRes = await agent.get('/test-city').expect(200);
  assert.match(cityRes.text, /9876543210/);
  await agent.get('/category/test-category').expect(200);
  await agent.get('/test-city/test-category').expect(200);
  await agent.get('/profile/verified-test-profile').expect(200).expect(/Chat on WhatsApp/);
  await agent.get('/search?q=Updated').expect(200).expect(/Updated Test Profile/);
  await agent.get('/sitemap.xml').expect(200).expect(/test-city\/test-category/);
  await agent.get('/robots.txt').expect(200).expect(/Disallow: \/admin/);

  await agent.post('/report').type('form').send({ _csrf: csrf, profileId: profile._id.toString(), reason: 'spam', details: 'Integration moderation test.' }).expect(302);
  const report = await Report.findOne({ profile: profile._id });
  assert.equal(report.status, 'open');
  await agent.put(`/admin/reports/${report._id}`).type('form').send({ _csrf: csrf, status: 'resolved', resolutionNotes: 'Reviewed in integration test.' }).expect(302);
  assert.equal((await Report.findById(report._id)).status, 'resolved');

  await agent.delete(`/admin/profiles/${profile._id}`).type('form').send({ _csrf: csrf }).expect(302);
  await agent.get('/profile/verified-test-profile').expect(404);
  assert.ok((await Profile.findById(profile._id)).deletedAt);
  await agent.put(`/admin/cities/${city._id}`).type('form').send({
    _csrf: csrf, name: 'Updated Test City', slug: 'test-city',
    phone: '9123456780', whatsapp: '919123456780',
    description: 'Updated city content.', active: 'on'
  }).expect(302);
  const updatedCity = await City.findById(city._id);
  assert.equal(updatedCity.phone, '9123456780');
  assert.equal(updatedCity.whatsapp, '919123456780');
  await agent.put(`/admin/categories/${category._id}`).type('form').send({ _csrf: csrf, name: 'Updated Test Category', slug: 'test-category', description: 'Updated category content.', active: 'on' }).expect(302);
  await agent.delete(`/admin/cities/${city._id}`).type('form').send({ _csrf: csrf }).expect(302);
  await agent.delete(`/admin/categories/${category._id}`).type('form').send({ _csrf: csrf }).expect(302);
  assert.equal(await City.findById(city._id), null);
  assert.equal(await Category.findById(category._id), null);
});


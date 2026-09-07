const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

process.env.MONGODB_URI = '';
process.env.SESSION_SECRET = 'test-secret-that-is-longer-than-thirty-two-characters';
const app = require('../app');

test('renders the public legal pages with security headers', async () => {
  const response = await request(app).get('/terms').expect(200);
  assert.match(response.text, /Terms of use/);
  assert.match(response.headers['content-security-policy'], /default-src 'self'/);
  assert.match(response.headers['content-security-policy'], /sc-static\.net/);
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('renders the admin login without exposing it to indexing', async () => {
  const response = await request(app).get('/admin/login').expect(200);
  assert.match(response.text, /Secure administration/);
  assert.match(response.text, /name="_csrf"/);
  assert.match(response.text, /noindex,nofollow/);
});

test('rejects state-changing requests without CSRF token', async () => {
  const response = await request(app).post('/admin/login').type('form').send({ email: 'admin@example.com', password: 'irrelevant-password' }).expect(403);
  assert.match(response.text, /403/);
});

test('redirects unauthenticated admin access to login', async () => {
  await request(app).get('/admin/profiles').expect(302).expect('Location', '/admin/login');
});

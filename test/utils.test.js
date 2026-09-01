const test = require('node:test');
const assert = require('node:assert/strict');
const makeSlug = require('../backend/utils/slug');
const { digitsOnly, whatsappUrl } = require('../backend/utils/whatsapp');
const { publishedFilter } = require('../backend/utils/publicQuery');

test('creates clean lowercase slugs', () => {
  assert.equal(makeSlug('  New Delhi Premium  '), 'new-delhi-premium');
});

test('normalizes and validates WhatsApp links', () => {
  assert.equal(digitsOnly('+91 98765-43210'), '919876543210');
  assert.match(whatsappUrl('+91 98765-43210', 'Asha'), /^https:\/\/wa\.me\/919876543210\?text=/);
  assert.equal(whatsappUrl('123'), null);
});

test('public query always enforces publication safeguards', () => {
  assert.deepEqual(publishedFilter({ featured: true }), { status: 'published', deletedAt: null, ageVerified: true, consentVerified: true, featured: true });
});

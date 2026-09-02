const test = require('node:test');
const assert = require('node:assert/strict');
const makeSlug = require('../backend/utils/slug');
const { digitsOnly, whatsappUrl } = require('../backend/utils/whatsapp');
const { publishedFilter } = require('../backend/utils/publicQuery');

test('creates clean lowercase slugs', () => {
  assert.equal(makeSlug('  New Delhi Premium  '), 'new-delhi-premium');
});

test('normalizes and validates WhatsApp links', () => {
  assert.equal(digitsOnly('+91 63516-15378'), '916351615378');
  assert.match(whatsappUrl('6351615378', 'Asha'), /^https:\/\/wa\.me\/916351615378\?text=/);
  assert.match(whatsappUrl('+91 98765-43210', 'Asha'), /^https:\/\/wa\.me\/919876543210\?text=/);
});

test('public query always enforces publication safeguards', () => {
  assert.deepEqual(publishedFilter({ featured: true }), { status: 'published', deletedAt: null, ageVerified: true, consentVerified: true, featured: true });
});

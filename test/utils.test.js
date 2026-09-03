const test = require('node:test');
const assert = require('node:assert/strict');
const makeSlug = require('../backend/utils/slug');
const { digitsOnly, whatsappUrl, cityWhatsappUrl, formatDisplayPhone } = require('../backend/utils/whatsapp');
const { publishedFilter } = require('../backend/utils/publicQuery');

test('creates clean lowercase slugs', () => {
  assert.equal(makeSlug('  New Delhi Premium  '), 'new-delhi-premium');
});

test('normalizes and validates WhatsApp links', () => {
  assert.equal(digitsOnly('+91 63516-15378'), '916351615378');
  assert.match(whatsappUrl('6351615378', 'Asha'), /^https:\/\/wa\.me\/916351615378\?text=/);
  assert.match(whatsappUrl('+91 98765-43210', 'Asha'), /^https:\/\/wa\.me\/919876543210\?text=/);
});

test('generates city-specific WhatsApp links and display numbers', () => {
  const city = { name: 'Goa', slug: 'goa', phone: '9876543210', whatsapp: '919876543210' };
  assert.equal(formatDisplayPhone(city.phone), '9876543210');
  assert.equal(formatDisplayPhone('919876543210'), '9876543210');
  assert.match(cityWhatsappUrl(city), /^https:\/\/wa\.me\/919876543210\?text=.*Goa/);
  
  const emptyCity = { name: 'Pune', slug: 'pune' };
  assert.match(cityWhatsappUrl(emptyCity), /^https:\/\/wa\.me\/916351615378\?text=.*Pune/);
});

test('public query always enforces publication safeguards', () => {
  assert.deepEqual(publishedFilter({ featured: true }), { status: 'published', deletedAt: null, ageVerified: true, consentVerified: true, featured: true });
});


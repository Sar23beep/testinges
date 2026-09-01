const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/publicController');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const { publishedFilter } = require('../utils/publicQuery');
const { absoluteUrl } = require('../utils/seo');

const router = express.Router();

router.get('/', asyncHandler(controller.home));
router.get('/search', asyncHandler(controller.search));
router.get('/about', controller.about);
router.get('/contact', controller.contact);
router.get('/privacy-policy', controller.privacy);
router.get('/terms', controller.terms);
router.get('/report', controller.report);
router.post('/report', [
  body('reason').isIn(['underage', 'non-consensual', 'fraud', 'privacy', 'illegal', 'spam', 'other']),
  body('details').optional().trim().isLength({ max: 2000 }),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) return next();
    const error = new Error('Please check the report fields and try again.'); error.status = 400; next(error);
  }
], asyncHandler(controller.submitReport));
router.get('/category/:categorySlug', asyncHandler(controller.categoryPage));
router.get('/profile/:profileSlug', asyncHandler(controller.profilePage));

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const [cities, categories, profiles, combinations] = await Promise.all([
    City.find({ active: true }).select('slug updatedAt').lean(), Category.find({ active: true }).select('slug updatedAt').lean(),
    Profile.find(publishedFilter()).select('slug updatedAt').lean(),
    Profile.aggregate([{ $match: publishedFilter() }, { $group: { _id: { city: '$city', category: '$category' }, updatedAt: { $max: '$updatedAt' } } }])
  ]);
  const cityMap = new Map(cities.map((item) => [String(item._id), item]));
  const categoryMap = new Map(categories.map((item) => [String(item._id), item]));
  const entries = [{ path: '/', updatedAt: new Date() },
    ...cities.map((item) => ({ path: `/${item.slug}`, updatedAt: item.updatedAt })),
    ...categories.map((item) => ({ path: `/category/${item.slug}`, updatedAt: item.updatedAt })),
    ...profiles.map((item) => ({ path: `/profile/${item.slug}`, updatedAt: item.updatedAt })),
    ...combinations.filter((item) => cityMap.has(String(item._id.city)) && categoryMap.has(String(item._id.category))).map((item) => ({ path: `/${cityMap.get(String(item._id.city)).slug}/${categoryMap.get(String(item._id.category)).slug}`, updatedAt: item.updatedAt }))
  ];
  const xml = entries.map((entry) => `<url><loc>${absoluteUrl(req, entry.path)}</loc><lastmod>${new Date(entry.updatedAt).toISOString()}</lastmod></url>`).join('');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${xml}</urlset>`);
}));

router.get('/robots.txt', (req, res) => res.type('text/plain').send(`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /search\nSitemap: ${absoluteUrl(req, '/sitemap.xml')}\n`));

router.get('/:citySlug/:categorySlug', asyncHandler(controller.cityCategoryPage));
router.get('/:citySlug', asyncHandler(controller.cityPage));

module.exports = router;

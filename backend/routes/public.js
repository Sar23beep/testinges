const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/publicController');
const asyncHandler = require('../utils/asyncHandler');
const { validationResult } = require('express-validator');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
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

// Google Search Console HTML File Verification Route
router.get('/google:code([a-zA-Z0-9]+).html', (req, res) => {
  res.type('text/html').send(`google-site-verification: google${req.params.code}.html`);
});

router.get('/sitemap.xml', asyncHandler(async (req, res) => {
  const [cities, categories, profiles, images, combinations] = await Promise.all([
    City.find({ active: true }).select('slug updatedAt name').lean(),
    Category.find({ active: true }).select('slug updatedAt name').lean(),
    Profile.find(publishedFilter()).select('_id slug updatedAt name area').lean(),
    ProfileImage.find({ isMain: true }).select('profile url alt').lean(),
    Profile.aggregate([{ $match: publishedFilter() }, { $group: { _id: { city: '$city', category: '$category' }, updatedAt: { $max: '$updatedAt' } } }])
  ]);
  const imageMap = new Map(images.map((img) => [String(img.profile), img]));
  const cityMap = new Map(cities.map((item) => [String(item._id), item]));
  const categoryMap = new Map(categories.map((item) => [String(item._id), item]));

  const urls = [];

  // 1. Home Page
  urls.push(`  <url>
    <loc>${absoluteUrl(req, '/')}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);

  // 2. Static Legal & Information Pages
  ['/about', '/terms', '/privacy-policy', '/contact'].forEach((path) => {
    urls.push(`  <url>
    <loc>${absoluteUrl(req, path)}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>`);
  });

  // 3. City Pages
  cities.forEach((city) => {
    urls.push(`  <url>
    <loc>${absoluteUrl(req, `/${city.slug}`)}</loc>
    <lastmod>${new Date(city.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`);
  });

  // 4. Category Pages
  categories.forEach((cat) => {
    urls.push(`  <url>
    <loc>${absoluteUrl(req, `/category/${cat.slug}`)}</loc>
    <lastmod>${new Date(cat.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
  });

  // 5. City + Category Combinations
  combinations.forEach((item) => {
    const city = cityMap.get(String(item._id.city));
    const cat = categoryMap.get(String(item._id.category));
    if (city && cat) {
      urls.push(`  <url>
    <loc>${absoluteUrl(req, `/${city.slug}/${cat.slug}`)}</loc>
    <lastmod>${new Date(item.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  });

  // 6. Profiles with Google Image Sitemap Tags
  profiles.forEach((profile) => {
    const img = imageMap.get(String(profile._id));
    const imageTag = img && img.url ? `
    <image:image>
      <image:loc>${img.url.startsWith('http') ? img.url : absoluteUrl(req, img.url)}</image:loc>
      <image:title>${profile.name || 'Verified Model'}</image:title>
      <image:caption>${img.alt || `${profile.name} in ${profile.area || ''}`}</image:caption>
    </image:image>` : '';

    urls.push(`  <url>
    <loc>${absoluteUrl(req, `/profile/${profile.slug}`)}</loc>
    <lastmod>${new Date(profile.updatedAt || Date.now()).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`);
  });

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`);
}));

router.get('/robots.txt', (req, res) => res.type('text/plain').send(
`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /search
Disallow: /api/

# Sitemap location for Google Search Console & Search Engines
Sitemap: ${absoluteUrl(req, '/sitemap.xml')}
`
));

router.get('/:citySlug/:categorySlug', asyncHandler(controller.cityCategoryPage));
router.get('/:citySlug', asyncHandler(controller.cityPage));

module.exports = router;

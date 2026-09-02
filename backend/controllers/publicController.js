const crypto = require('crypto');
const mongoose = require('mongoose');
const City = require('../models/City');
const Category = require('../models/Category');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
const SeoPage = require('../models/SeoPage');
const Report = require('../models/Report');
const { publishedFilter } = require('../utils/publicQuery');
const { seo, absoluteUrl } = require('../utils/seo');
const { whatsappUrl } = require('../utils/whatsapp');

const PAGE_SIZE = 12;
const badgeRank = { VVIP: 0, VIP: 1, HOT: 2, NORMAL: 3 };

async function hydrateProfiles(profiles) {
  const ids = profiles.map((profile) => profile._id);
  const images = await ProfileImage.find({ profile: { $in: ids } }).sort({ isMain: -1, sortOrder: 1 }).lean();
  const grouped = images.reduce((map, image) => {
    const key = String(image.profile);
    if (!map[key]) map[key] = [];
    map[key].push(image);
    return map;
  }, {});
  return profiles.map((profile) => ({ ...profile, images: grouped[String(profile._id)] || [], mainImage: grouped[String(profile._id)]?.[0] || null, whatsappUrl: whatsappUrl(profile.whatsapp, profile.name) }));
}

function pageNumber(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function relatedProfiles(profile, limit = 8) {
  const selected = [];
  const excludedIds = [profile._id];

  async function appendMatches(extraFilter) {
    const remaining = limit - selected.length;
    if (remaining <= 0) return;
    const matches = await Profile.find(publishedFilter({
      ...extraFilter,
      _id: { $nin: excludedIds }
    }))
      .select('+whatsapp')
      .populate('city category')
      .sort({ featured: -1, createdAt: -1 })
      .limit(remaining)
      .lean();
    selected.push(...matches);
    excludedIds.push(...matches.map((item) => item._id));
  }

  await appendMatches({ city: profile.city._id, category: profile.category._id });
  await appendMatches({ $or: [{ city: profile.city._id }, { category: profile.category._id }] });
  await appendMatches({});

  return hydrateProfiles(selected);
}

async function home(req, res) {
  const filter = publishedFilter();
  const [cities, categories, profiles] = await Promise.all([
    City.find({ active: true }).sort({ sortOrder: 1, name: 1 }).limit(20).lean(),
    Category.find({ active: true }).sort({ sortOrder: 1, name: 1 }).limit(20).lean(),
    Profile.find(filter).select('+whatsapp').populate('city category').sort({ featured: -1, createdAt: -1 }).limit(40).lean()
  ]);
  const hydrated = await hydrateProfiles(profiles);
  const sortBadge = (items, badge) => items.filter((p) => p.badge === badge).slice(0, 8);
  res.render('public/home', {
    seo: seo(req), cities, categories,
    featured: hydrated.filter((p) => p.featured).slice(0, 8),
    vvip: sortBadge(hydrated, 'VVIP'), vip: sortBadge(hydrated, 'VIP'), hot: sortBadge(hydrated, 'HOT'),
    recent: [...hydrated].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8),
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Sanjana Malhotra', url: absoluteUrl(req, '/'), potentialAction: { '@type': 'SearchAction', target: `${absoluteUrl(req, '/search')}?q={search_term_string}`, 'query-input': 'required name=search_term_string' } }
  });
}

async function search(req, res) {
  const page = pageNumber(req.query.page);
  const query = publishedFilter();
  const q = String(req.query.q || '').trim().slice(0, 80);
  if (q) query.$text = { $search: q };
  if (mongoose.isValidObjectId(req.query.city)) query.city = req.query.city;
  if (mongoose.isValidObjectId(req.query.category)) query.category = req.query.category;
  if (['NORMAL', 'HOT', 'VIP', 'VVIP'].includes(req.query.badge)) query.badge = req.query.badge;
  if (req.query.featured === 'true') query.featured = true;
  const [profiles, total, cities, categories] = await Promise.all([
    Profile.find(query).select('+whatsapp').populate('city category').sort({ featured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Profile.countDocuments(query), City.find({ active: true }).sort('name').lean(), Category.find({ active: true }).sort('name').lean()
  ]);
  res.render('public/search', {
    seo: seo(req, { title: q ? `Search results for ${q} — Sanjana Malhotra` : 'Search profiles — Sanjana Malhotra', description: 'Search published profiles by city, category and name.', robots: 'noindex,follow' }),
    profiles: await hydrateProfiles(profiles), total, page, pages: Math.ceil(total / PAGE_SIZE), cities, categories, filters: req.query, q, jsonLd: null
  });
}

async function categoryPage(req, res, next) {
  const category = await Category.findOne({ slug: req.params.categorySlug, active: true }).lean();
  if (!category) return next();
  const page = pageNumber(req.query.page);
  const filter = publishedFilter({ category: category._id });
  const [profiles, total, cities] = await Promise.all([
    Profile.find(filter).select('+whatsapp').populate('city category').sort({ featured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Profile.countDocuments(filter),
    City.find({ active: true }).sort('name').lean()
  ]);
  const indexable = total > 0;
  const title = category.seoTitle || `${category.name} Call Girls & Verified Escorts in India | Sanjana Malhotra`;
  const description = category.seoDescription || `Explore verified ${category.name.toLowerCase()} call girls, VIP models and independent escorts across all major Indian cities. Direct WhatsApp contact on 6351615378.`;
  const heading = category.h1 || `${category.name} Call Girls & Escorts`;
  res.render('public/listing', {
    seo: seo(req, { title, description, robots: indexable ? 'index,follow' : 'noindex,follow' }),
    heading, intro: category.description || description, profiles: await hydrateProfiles(profiles), total, page, pages: Math.ceil(total / PAGE_SIZE), city: null, category, relatedCities: cities, relatedCategories: [], jsonLd: itemListLd(req, profiles, title)
  });
}

async function cityPage(req, res, next) {
  const city = await City.findOne({ slug: req.params.citySlug, active: true }).lean();
  if (!city) return next();
  const page = pageNumber(req.query.page);
  const filter = publishedFilter({ city: city._id });
  const [profiles, total, categories] = await Promise.all([
    Profile.find(filter).select('+whatsapp').populate('city category').sort({ featured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Profile.countDocuments(filter), Category.find({ active: true }).sort('name').lean()
  ]);
  const title = city.seoTitle || `Call Girls in ${city.name} - 100% Genuine Escorts in ${city.name} | Sanjana Malhotra`;
  const description = city.seoDescription || `Find verified Call Girls in ${city.name} & independent escorts in ${city.name} (${city.state || 'India'}). Real photos, VIP service, direct WhatsApp 6351615378. 100% genuine independent profiles.`;
  const heading = city.h1 || `Call Girls in ${city.name} — Verified Escorts & Companions`;
  const intro = city.description || `Explore 18+ verified call girls, independent escorts and luxury companions in ${city.name}. Connect directly with genuine models on WhatsApp with zero middlemen.`;
  res.render('public/listing', {
    seo: seo(req, { title, description, robots: total ? 'index,follow' : 'noindex,follow' }),
    heading, intro, profiles: await hydrateProfiles(profiles), total, page, pages: Math.ceil(total / PAGE_SIZE), city, category: null, relatedCities: [], relatedCategories: categories, jsonLd: itemListLd(req, profiles, title)
  });
}

async function cityCategoryPage(req, res, next) {
  const [city, category] = await Promise.all([
    City.findOne({ slug: req.params.citySlug, active: true }).lean(),
    Category.findOne({ slug: req.params.categorySlug, active: true }).lean()
  ]);
  if (!city || !category) return next();
  const page = pageNumber(req.query.page);
  const filter = publishedFilter({ city: city._id, category: category._id });
  const [profiles, total, override] = await Promise.all([
    Profile.find(filter).select('+whatsapp').populate('city category').sort({ featured: -1, createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    Profile.countDocuments(filter), SeoPage.findOne({ city: city._id, category: category._id }).lean()
  ]);
  const title = override?.seoTitle || `${category.name} Call Girls in ${city.name} - ${category.name} Escorts in ${city.name} | Sanjana Malhotra`;
  const description = override?.seoDescription || `Book premium ${category.name.toLowerCase()} call girls in ${city.name} & verified escorts. 100% real photos, direct contact on WhatsApp 6351615378.`;
  const heading = override?.h1 || `${category.name} Call Girls in ${city.name}`;
  const intro = override?.introContent || `Discover high-class ${category.name.toLowerCase()} call girls and escort services in ${city.name}. Safe, verified, and confidential direct booking.`;
  res.render('public/listing', {
    seo: seo(req, { title, description, robots: total && override?.indexable !== false ? 'index,follow' : 'noindex,follow' }),
    heading, intro, profiles: await hydrateProfiles(profiles), total, page, pages: Math.ceil(total / PAGE_SIZE), city, category, relatedCities: [], relatedCategories: [], jsonLd: itemListLd(req, profiles, title)
  });
}

async function profilePage(req, res, next) {
  const profile = await Profile.findOne(publishedFilter({ slug: req.params.profileSlug })).select('+whatsapp +phone').populate('city category').lean();
  if (!profile) return next();
  const [images, related] = await Promise.all([
    ProfileImage.find({ profile: profile._id }).sort({ isMain: -1, sortOrder: 1 }).lean(),
    relatedProfiles(profile)
  ]);
  profile.images = images;
  profile.mainImage = images[0] || null;
  profile.whatsappUrl = whatsappUrl(profile.whatsapp, profile.name);
  const title = profile.seoTitle || `${profile.name} (${profile.displayAge || 22} Yrs) - Call Girl in ${profile.area || profile.city.name}, ${profile.city.name} | WhatsApp 6351615378`;
  const description = profile.seoDescription || `Connect directly with ${profile.name}, 18+ verified independent call girl in ${profile.area || profile.city.name}, ${profile.city.name}. Real photos, verified phone and WhatsApp 6351615378.`;
  res.render('public/profile', {
    seo: seo(req, { title, description, image: profile.seoOgImage || profile.mainImage?.url, type: 'profile' }),
    profile, related, jsonLd: {
      '@context': 'https://schema.org', '@type': 'ProfilePage', name: title, url: absoluteUrl(req, req.path),
      mainEntity: { '@type': 'Person', name: profile.name, image: images.map((item) => item.url), description: profile.description }
    }
  });
}

function itemListLd(req, profiles, name) {
  return { '@context': 'https://schema.org', '@type': 'ItemList', name, itemListElement: profiles.map((p, index) => ({ '@type': 'ListItem', position: index + 1, url: absoluteUrl(req, `/profile/${p.slug}`), name: p.name })) };
}

async function submitReport(req, res) {
  const profile = mongoose.isValidObjectId(req.body.profileId) ? await Profile.findById(req.body.profileId).lean() : null;
  const ipHash = crypto.createHash('sha256').update(`${req.ip}:${process.env.SESSION_SECRET}`).digest('hex');
  await Report.create({ profile: profile?._id || null, reason: req.body.reason, details: req.body.details, reporterEmail: req.body.email, ipHash });
  req.flash('success', 'Thank you. Your report has been submitted for moderation.');
  res.redirect(profile ? `/profile/${profile.slug}` : '/report');
}

function staticPage(view, title, description) {
  return (req, res) => res.render(`public/${view}`, { seo: seo(req, { title: `${title} — Sanjana Malhotra`, description }), jsonLd: null });
}

module.exports = {
  home, search, categoryPage, cityPage, cityCategoryPage, profilePage, submitReport,
  about: staticPage('about', 'About', 'Learn about Sanjana Malhotra and our privacy-conscious directory standards.'),
  contact: staticPage('contact', 'Contact', 'Contact the Sanjana Malhotra directory team.'),
  privacy: staticPage('privacy', 'Privacy policy', 'Read how Sanjana Malhotra protects personal information and privacy.'),
  terms: staticPage('terms', 'Terms', 'Terms governing use of the Sanjana Malhotra directory.'),
  report: staticPage('report', 'Report content', 'Confidentially report unsafe, unlawful or prohibited content.')
};

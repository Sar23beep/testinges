const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const Profile = require('../models/Profile');
const ProfileImage = require('../models/ProfileImage');
const City = require('../models/City');
const Category = require('../models/Category');
const Report = require('../models/Report');
const SeoPage = require('../models/SeoPage');
const Setting = require('../models/Setting');
const makeSlug = require('../utils/slug');
const { digitsOnly } = require('../utils/whatsapp');
const { uploadBuffer, deleteAsset } = require('../services/imageService');

const PROFILE_PAGE_SIZE = 20;

function cleanText(value, max = 5000) {
  return String(value || '').replace(/<[^>]*>/g, '').trim().slice(0, max);
}

function checked(value) {
  return value === 'on' || value === 'true' || value === true;
}

async function loginPage(req, res) {
  if (res.locals.currentAdmin) return res.redirect('/admin');
  res.render('admin/login', { layout: false, pageTitle: 'Admin login' });
}

async function login(req, res) {
  const email = cleanText(req.body.email, 180).toLowerCase();
  const admin = await Admin.findOne({ email, active: true }).select('+passwordHash');
  if (!admin || !(await admin.verifyPassword(String(req.body.password || '')))) {
    req.flash('error', 'Invalid email or password.');
    return res.redirect('/admin/login');
  }
  const returnTo = req.session.returnTo;
  req.session.regenerate((error) => {
    if (error) return res.status(500).send('Unable to create session');
    req.session.adminId = admin._id.toString();
    req.session.csrfToken = require('crypto').randomBytes(32).toString('hex');
    admin.lastLoginAt = new Date();
    admin.save().catch(console.error);
    res.redirect(returnTo || '/admin');
  });
}

function logout(req, res) {
  req.session.destroy(() => res.redirect('/admin/login'));
}

async function dashboard(req, res) {
  const [profiles, published, cities, categories, openReports, recentReports] = await Promise.all([
    Profile.countDocuments({ deletedAt: null }), Profile.countDocuments({ status: 'published', deletedAt: null }),
    City.countDocuments({ active: true }), Category.countDocuments({ active: true }), Report.countDocuments({ status: 'open' }),
    Report.find().populate('profile', 'name slug').sort({ createdAt: -1 }).limit(5).lean()
  ]);
  res.render('admin/dashboard', { pageTitle: 'Dashboard', stats: { profiles, published, cities, categories, openReports }, recentReports });
}

async function profiles(req, res) {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const query = req.query.deleted === 'true' ? { deletedAt: { $ne: null } } : { deletedAt: null };
  const q = cleanText(req.query.q, 80);
  if (q) query.name = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
  if (mongoose.isValidObjectId(req.query.city)) query.city = req.query.city;
  if (mongoose.isValidObjectId(req.query.category)) query.category = req.query.category;
  if (['NORMAL', 'HOT', 'VIP', 'VVIP'].includes(req.query.badge)) query.badge = req.query.badge;
  if (['draft', 'published', 'hidden'].includes(req.query.status)) query.status = req.query.status;
  const sort = req.query.sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };
  const [items, total, cities, categories] = await Promise.all([
    Profile.find(query).populate('city category').sort(sort).skip((page - 1) * PROFILE_PAGE_SIZE).limit(PROFILE_PAGE_SIZE).lean(),
    Profile.countDocuments(query), City.find().sort('name').lean(), Category.find().sort('name').lean()
  ]);
  res.render('admin/profiles/index', { pageTitle: 'Profiles', profiles: items, total, page, pages: Math.ceil(total / PROFILE_PAGE_SIZE), cities, categories, filters: req.query });
}

async function profileForm(req, res, next) {
  const [cities, categories, profile] = await Promise.all([
    City.find({ active: true }).sort('name').lean(), Category.find({ active: true }).sort('name').lean(),
    req.params.id ? Profile.findById(req.params.id).select('+phone +whatsapp').lean() : null
  ]);
  if (req.params.id && !profile) return next();
  const images = profile ? await ProfileImage.find({ profile: profile._id }).sort({ isMain: -1, sortOrder: 1 }).lean() : [];
  res.render('admin/profiles/form', { pageTitle: profile ? 'Edit profile' : 'Create profile', profile, images, cities, categories });
}

function profilePayload(body) {
  const status = ['draft', 'published', 'hidden'].includes(body.status) ? body.status : 'draft';
  return {
    name: cleanText(body.name, 100), slug: makeSlug(body.slug || body.name), city: body.city, category: body.category,
    description: cleanText(body.description), phone: digitsOnly(body.phone), whatsapp: digitsOnly(body.whatsapp),
    displayAge: Number.parseInt(body.displayAge, 10) || undefined,
    heightCm: Number.parseInt(body.heightCm, 10) || undefined,
    languages: cleanText(body.languages, 500).split(',').map((item) => item.trim()).filter(Boolean).slice(0, 10),
    availability: ['', 'Flexible', 'Daytime', 'Evening', 'Night'].includes(body.availability) ? body.availability : '',
    area: cleanText(body.area, 120),
    badge: ['NORMAL', 'HOT', 'VIP', 'VVIP'].includes(body.badge) ? body.badge : 'NORMAL',
    tags: cleanText(body.tags, 500).split(',').map((item) => item.trim()).filter(Boolean).slice(0, 20),
    featured: checked(body.featured), status, ageVerified: checked(body.ageVerified), consentVerified: checked(body.consentVerified),
    seoTitle: cleanText(body.seoTitle, 70), seoDescription: cleanText(body.seoDescription, 170), seoOgImage: cleanText(body.seoOgImage, 500),
    publishedAt: status === 'published' ? new Date() : null
  };
}

async function createProfile(req, res) {
  const payload = profilePayload(req.body);
  if (!payload.name || !payload.slug || !payload.description || !payload.whatsapp || !mongoose.isValidObjectId(payload.city) || !mongoose.isValidObjectId(payload.category)) {
    req.flash('error', 'Complete all required profile fields.');
    return res.redirect('/admin/profiles/create');
  }
  if (payload.status === 'published' && (!payload.ageVerified || !payload.consentVerified)) {
    req.flash('error', 'Age and consent verification are required before publication.');
    return res.redirect('/admin/profiles/create');
  }
  const profile = await Profile.create(payload);
  req.flash('success', 'Profile created. You can now upload its images.');
  res.redirect(`/admin/profiles/edit/${profile._id}`);
}

async function updateProfile(req, res, next) {
  const payload = profilePayload(req.body);
  if (payload.status === 'published' && (!payload.ageVerified || !payload.consentVerified)) {
    req.flash('error', 'Age and consent verification are required before publication.');
    return res.redirect(`/admin/profiles/edit/${req.params.id}`);
  }
  const profile = await Profile.findOneAndUpdate({ _id: req.params.id, deletedAt: null }, payload, { runValidators: true, new: true });
  if (!profile) return next();
  req.flash('success', 'Profile updated.');
  res.redirect(`/admin/profiles/edit/${profile._id}`);
}

async function deleteProfile(req, res, next) {
  const profile = await Profile.findByIdAndUpdate(req.params.id, { deletedAt: new Date(), status: 'hidden' });
  if (!profile) return next();
  req.flash('success', 'Profile moved to deleted items and can be restored.');
  res.redirect('/admin/profiles');
}

async function restoreProfile(req, res, next) {
  const profile = await Profile.findByIdAndUpdate(req.params.id, { deletedAt: null, status: 'draft' });
  if (!profile) return next();
  req.flash('success', 'Profile restored as a draft.');
  res.redirect('/admin/profiles?deleted=true');
}

async function saveCoverImage(profile, file) {
  const currentCover = await ProfileImage.findOne({ profile: profile._id, isMain: true });
  if (!currentCover && await ProfileImage.countDocuments({ profile: profile._id }) >= 10) {
    throw Object.assign(new Error('Delete one gallery image before adding a cover image.'), { status: 400 });
  }

  const result = await uploadBuffer(file.buffer, 'veloura/profiles/covers');
  if (result.width < 500 || result.height < 500) {
    await deleteAsset(result.public_id);
    throw Object.assign(new Error('The cover image must be at least 500 x 500 pixels.'), { status: 400 });
  }

  const imageData = {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    alt: `${profile.name} cover image`,
    isMain: true
  };

  if (currentCover) {
    const oldPublicId = currentCover.publicId;
    Object.assign(currentCover, imageData);
    try {
      await currentCover.save();
    } catch (error) {
      await deleteAsset(result.public_id);
      throw error;
    }
    await ProfileImage.updateMany({ profile: profile._id, _id: { $ne: currentCover._id } }, { isMain: false });
    await deleteAsset(oldPublicId);
    return currentCover;
  }

  await ProfileImage.updateMany({ profile: profile._id }, { isMain: false });
  try {
    return await ProfileImage.create({ profile: profile._id, ...imageData, sortOrder: -1 });
  } catch (error) {
    await deleteAsset(result.public_id);
    throw error;
  }
}

async function uploadCoverImage(req, res, next) {
  const profile = await Profile.findOne({ _id: req.params.id, deletedAt: null });
  if (!profile) return next();
  if (!req.file) {
    req.flash('error', 'Choose a cover image to upload.');
    return res.redirect(`/admin/profiles/edit/${profile._id}`);
  }
  await saveCoverImage(profile, req.file);
  req.flash('success', 'Cover image uploaded to Cloudinary.');
  res.redirect(`/admin/profiles/edit/${profile._id}`);
}

async function uploadImages(req, res, next) {
  const profile = await Profile.findById(req.params.id);
  if (!profile) return next();
  if (!req.files?.length) {
    req.flash('error', 'Choose at least one image.');
    return res.redirect(`/admin/profiles/edit/${profile._id}`);
  }
  const count = await ProfileImage.countDocuments({ profile: profile._id });
  if (count + req.files.length > 10) throw Object.assign(new Error('A profile may have at most 10 images.'), { status: 400 });
  for (let index = 0; index < req.files.length; index += 1) {
    const result = await uploadBuffer(req.files[index].buffer);
    if (result.width < 500 || result.height < 500) {
      await deleteAsset(result.public_id);
      throw Object.assign(new Error('Each image must be at least 500 × 500 pixels.'), { status: 400 });
    }
    await ProfileImage.create({ profile: profile._id, url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, bytes: result.bytes, alt: `${profile.name} profile image`, isMain: count === 0 && index === 0, sortOrder: count + index });
  }
  req.flash('success', 'Images uploaded and optimized.');
  res.redirect(`/admin/profiles/edit/${profile._id}`);
}

async function replaceImage(req, res, next) {
  const image = await ProfileImage.findOne({ _id: req.params.imageId, profile: req.params.id });
  if (!image) return next();
  if (!req.file) throw Object.assign(new Error('Choose a replacement image.'), { status: 400 });
  const result = await uploadBuffer(req.file.buffer);
  if (result.width < 500 || result.height < 500) {
    await deleteAsset(result.public_id);
    throw Object.assign(new Error('The image must be at least 500 × 500 pixels.'), { status: 400 });
  }
  const oldPublicId = image.publicId;
  Object.assign(image, { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, bytes: result.bytes });
  await image.save();
  await deleteAsset(oldPublicId);
  req.flash('success', 'Image replaced.');
  res.redirect(`/admin/profiles/edit/${req.params.id}`);
}

async function setMainImage(req, res, next) {
  const image = await ProfileImage.findOne({ _id: req.params.imageId, profile: req.params.id });
  if (!image) return next();
  await ProfileImage.updateMany({ profile: image.profile }, { isMain: false });
  image.isMain = true;
  await image.save();
  req.flash('success', 'Main image updated.');
  res.redirect(`/admin/profiles/edit/${req.params.id}`);
}

async function reorderImages(req, res) {
  const ids = Array.isArray(req.body.imageIds) ? req.body.imageIds : String(req.body.imageIds || '').split(',').filter(Boolean);
  await Promise.all(ids.map((id, index) => ProfileImage.updateOne({ _id: id, profile: req.params.id }, { sortOrder: index })));
  req.flash('success', 'Image order updated.');
  res.redirect(`/admin/profiles/edit/${req.params.id}`);
}

async function deleteImage(req, res, next) {
  const image = await ProfileImage.findOne({ _id: req.params.imageId, profile: req.params.id });
  if (!image) return next();
  await deleteAsset(image.publicId);
  await image.deleteOne();
  if (image.isMain) {
    const replacement = await ProfileImage.findOne({ profile: req.params.id }).sort({ sortOrder: 1 });
    if (replacement) { replacement.isMain = true; await replacement.save(); }
  }
  req.flash('success', 'Image deleted.');
  res.redirect(`/admin/profiles/edit/${req.params.id}`);
}

function contentPayload(body) {
  return {
    name: cleanText(body.name, 100), slug: makeSlug(body.slug || body.name), description: cleanText(body.description),
    h1: cleanText(body.h1, 180), seoTitle: cleanText(body.seoTitle, 70), seoDescription: cleanText(body.seoDescription, 170),
    phone: digitsOnly(body.phone), whatsapp: digitsOnly(body.whatsapp),
    active: checked(body.active), sortOrder: Number.parseInt(body.sortOrder, 10) || 0
  };
}

function makeContentActions(Model, singular, plural) {
  return {
    index: async (req, res) => res.render(`admin/${plural}/index`, { pageTitle: plural[0].toUpperCase() + plural.slice(1), items: await Model.find().sort({ sortOrder: 1, name: 1 }).lean() }),
    create: async (req, res) => { await Model.create(contentPayload(req.body)); req.flash('success', `${singular} created.`); res.redirect(`/admin/${plural}`); },
    update: async (req, res, next) => { const item = await Model.findByIdAndUpdate(req.params.id, contentPayload(req.body), { runValidators: true, new: true }); if (!item) return next(); req.flash('success', `${singular} updated.`); res.redirect(`/admin/${plural}`); },
    remove: async (req, res) => {
      const inUse = await Profile.exists({ [singular.toLowerCase()]: req.params.id, deletedAt: null });
      if (inUse) { req.flash('error', `Cannot delete a ${singular.toLowerCase()} used by profiles. Disable it instead.`); return res.redirect(`/admin/${plural}`); }
      await Model.findByIdAndDelete(req.params.id); req.flash('success', `${singular} deleted.`); res.redirect(`/admin/${plural}`);
    }
  };
}

const cityActions = makeContentActions(City, 'City', 'cities');
const categoryActions = makeContentActions(Category, 'Category', 'categories');

async function reports(req, res) {
  const query = ['open', 'reviewing', 'resolved', 'dismissed'].includes(req.query.status) ? { status: req.query.status } : {};
  res.render('admin/reports', { pageTitle: 'Reports', reports: await Report.find(query).populate('profile', 'name slug status').sort({ createdAt: -1 }).lean(), filter: req.query.status || '' });
}

async function updateReport(req, res, next) {
  const status = ['open', 'reviewing', 'resolved', 'dismissed'].includes(req.body.status) ? req.body.status : 'open';
  const report = await Report.findByIdAndUpdate(req.params.id, { status, resolutionNotes: cleanText(req.body.resolutionNotes, 2000) });
  if (!report) return next();
  req.flash('success', 'Report updated.');
  res.redirect('/admin/reports');
}

async function media(req, res) {
  res.render('admin/media', { pageTitle: 'Media library', images: await ProfileImage.find().populate('profile', 'name slug').sort({ createdAt: -1 }).limit(100).lean() });
}

async function settings(req, res) {
  const rows = await Setting.find().lean();
  res.render('admin/settings', { pageTitle: 'Settings', siteSettings: Object.fromEntries(rows.map((row) => [row.key, row.value])) });
}

async function updateSettings(req, res) {
  const allowed = ['siteName', 'contactEmail', 'footerText'];
  await Promise.all(allowed.map((key) => Setting.updateOne({ key }, { value: cleanText(req.body[key], key === 'footerText' ? 300 : 180) }, { upsert: true })));
  req.flash('success', 'Settings saved.');
  res.redirect('/admin/settings');
}

async function seoPages(req, res) {
  const [pages, cities, categories] = await Promise.all([SeoPage.find().populate('city category').lean(), City.find({ active: true }).sort('name').lean(), Category.find({ active: true }).sort('name').lean()]);
  res.render('admin/seo-pages', { pageTitle: 'City + category SEO', pages, cities, categories });
}

async function upsertSeoPage(req, res) {
  await SeoPage.findOneAndUpdate({ city: req.body.city, category: req.body.category }, {
    seoTitle: cleanText(req.body.seoTitle, 70), seoDescription: cleanText(req.body.seoDescription, 170), h1: cleanText(req.body.h1, 180), introContent: cleanText(req.body.introContent), indexable: checked(req.body.indexable)
  }, { upsert: true, runValidators: true });
  req.flash('success', 'SEO override saved.');
  res.redirect('/admin/seo-pages');
}

module.exports = { loginPage, login, logout, dashboard, profiles, profileForm, createProfile, updateProfile, deleteProfile, restoreProfile, uploadCoverImage, uploadImages, replaceImage, setMainImage, reorderImages, deleteImage, cityActions, categoryActions, reports, updateReport, media, settings, updateSettings, seoPages, upsertSeoPage };

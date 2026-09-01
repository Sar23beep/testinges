const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('../controllers/adminController');
const { requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: 'draft-8', legacyHeaders: false, message: 'Too many login attempts. Try again later.' });

router.get('/login', asyncHandler(controller.loginPage));
router.post('/login', loginLimiter, asyncHandler(controller.login));
router.post('/logout', requireAdmin, controller.logout);
router.use(requireAdmin);
router.get('/', asyncHandler(controller.dashboard));
router.get('/profiles', asyncHandler(controller.profiles));
router.get('/profiles/create', asyncHandler(controller.profileForm));
router.post('/profiles', asyncHandler(controller.createProfile));
router.get('/profiles/edit/:id', asyncHandler(controller.profileForm));
router.put('/profiles/:id', asyncHandler(controller.updateProfile));
router.delete('/profiles/:id', asyncHandler(controller.deleteProfile));
router.post('/profiles/:id/restore', asyncHandler(controller.restoreProfile));
router.post('/profiles/:id/cover', upload.single('coverImage'), asyncHandler(controller.uploadCoverImage));
router.post('/profiles/:id/images', upload.array('images', 10), asyncHandler(controller.uploadImages));
router.post('/profiles/:id/images/:imageId/replace', upload.single('image'), asyncHandler(controller.replaceImage));
router.post('/profiles/:id/images/reorder', asyncHandler(controller.reorderImages));
router.post('/profiles/:id/images/:imageId/main', asyncHandler(controller.setMainImage));
router.delete('/profiles/:id/images/:imageId', asyncHandler(controller.deleteImage));

router.get('/categories', asyncHandler(controller.categoryActions.index));
router.post('/categories', asyncHandler(controller.categoryActions.create));
router.put('/categories/:id', asyncHandler(controller.categoryActions.update));
router.delete('/categories/:id', asyncHandler(controller.categoryActions.remove));
router.get('/cities', asyncHandler(controller.cityActions.index));
router.post('/cities', asyncHandler(controller.cityActions.create));
router.put('/cities/:id', asyncHandler(controller.cityActions.update));
router.delete('/cities/:id', asyncHandler(controller.cityActions.remove));
router.get('/media', asyncHandler(controller.media));
router.get('/reports', asyncHandler(controller.reports));
router.put('/reports/:id', asyncHandler(controller.updateReport));
router.get('/settings', asyncHandler(controller.settings));
router.put('/settings', asyncHandler(controller.updateSettings));
router.get('/seo-pages', asyncHandler(controller.seoPages));
router.post('/seo-pages', asyncHandler(controller.upsertSeoPage));

module.exports = router;

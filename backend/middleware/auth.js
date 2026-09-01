const Admin = require('../models/Admin');

async function loadAdmin(req, res, next) {
  res.locals.currentAdmin = null;
  if (!req.session?.adminId) return next();
  try {
    const admin = await Admin.findOne({ _id: req.session.adminId, active: true }).lean();
    if (!admin) delete req.session.adminId;
    res.locals.currentAdmin = admin;
    next();
  } catch (error) {
    next(error);
  }
}

function requireAdmin(req, res, next) {
  if (res.locals.currentAdmin) return next();
  if (req.accepts('html')) {
    req.session.returnTo = req.originalUrl;
    return res.redirect('/admin/login');
  }
  return res.status(401).json({ error: 'Authentication required' });
}

module.exports = { loadAdmin, requireAdmin };

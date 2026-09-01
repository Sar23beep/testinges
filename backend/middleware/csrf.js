const crypto = require('crypto');

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function ensureCsrfToken(req, res, next) {
  if (!req.session.csrfToken) req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  res.locals.csrfToken = req.session.csrfToken;
  next();
}

function verifyCsrf(req, res, next) {
  if (SAFE_METHODS.has(req.method)) return next();
  const supplied = req.body?._csrf || req.get('x-csrf-token') || '';
  const expected = req.session?.csrfToken || '';
  const valid = supplied.length === expected.length && supplied.length > 0 &&
    crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) {
    const error = new Error('Your session form token expired. Refresh the page and try again.');
    error.status = 403;
    return next(error);
  }
  next();
}

module.exports = { ensureCsrfToken, verifyCsrf };

function notFound(req, res, next) {
  const error = new Error('The page you requested could not be found.');
  error.status = 404;
  next(error);
}

function errorHandler(error, req, res, next) {
  const status = Number(error.status || error.statusCode) || 500;
  if (status >= 500) console.error(error);
  const view = status === 403 ? 'errors/403' : status === 404 ? 'errors/404' : 'errors/500';
  if (req.accepts('html')) {
    return res.status(status).render(view, {
      pageTitle: `${status} — Veloura`,
      error: process.env.NODE_ENV === 'development' ? error : null,
      jsonLd: null,
      seo: { title: `${status} — Veloura`, description: 'Error page', canonical: '', image: '', robots: 'noindex,nofollow', type: 'website' }
    });
  }
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : error.message });
}

module.exports = { notFound, errorHandler };

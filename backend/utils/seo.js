const DEFAULT_IMAGE = '/images/og-default.svg';

function absoluteUrl(req, path = '/') {
  const base = (process.env.BASE_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function seo(req, values = {}) {
  const title = values.title || 'Sanjana Malhotra — Discover trusted profiles near you';
  const description = values.description || 'Explore verified, independently managed profiles by city and category in a privacy-conscious directory.';
  const canonicalPath = values.canonicalPath || req.path;
  const image = values.image || DEFAULT_IMAGE;
  return {
    title,
    description,
    canonical: absoluteUrl(req, canonicalPath),
    image: image.startsWith('http') ? image : absoluteUrl(req, image),
    robots: values.robots || 'index,follow',
    type: values.type || 'website'
  };
}

module.exports = { absoluteUrl, seo };

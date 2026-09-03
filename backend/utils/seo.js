const DEFAULT_IMAGE = '/images/og-default.svg';

function absoluteUrl(req, path = '/') {
  if (process.env.BASE_URL && process.env.BASE_URL.startsWith('http')) {
    const base = process.env.BASE_URL.replace(/\/$/, '');
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }
  const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
  const host = req.get('x-forwarded-host') || req.get('host') || 'localhost:3000';
  const base = `${protocol}://${host}`.replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function seo(req, values = {}) {
  const title = values.title || 'Sanjana Malhotra — 100% Verified Escorts & Call Girls Directory in India';
  const description = values.description || 'India’s premier independent directory for verified call girls, luxury escorts, and VIP companions. Direct WhatsApp & Call booking across 180+ Indian cities.';
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

function breadcrumbLd(req, crumbs = []) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: absoluteUrl(req, crumb.url)
    }))
  };
}

function cityFaqLd(cityName, phone = '6351615378') {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `How do I book a verified call girl in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Browse the verified profiles on Sanjana Malhotra, choose your desired companion in ${cityName}, and click the direct WhatsApp button or call +91 ${phone} to connect with zero middlemen.`
        }
      },
      {
        '@type': 'Question',
        name: `Are all profile photos of ${cityName} escorts 100% genuine?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. All independent companion profiles in ${cityName} published on Sanjana Malhotra undergo age, identity, and photo verification.`
        }
      },
      {
        '@type': 'Question',
        name: `Which areas in ${cityName} are covered for escort services?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Independent companions are available across all prime locations, 5-star hotels, and residences in ${cityName} and surrounding areas.`
        }
      },
      {
        '@type': 'Question',
        name: `Is my privacy and discretion protected in ${cityName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. All interactions are 100% confidential and direct between you and the companion with complete discretion.`
        }
      }
    ]
  };
}

function organizationLd(req) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Sanjana Malhotra',
    alternateName: ['Sanjana Malhotra Escorts', 'Sanjana Malhotra Directory'],
    url: absoluteUrl(req, '/'),
    potentialAction: {
      '@type': 'SearchAction',
      target: `${absoluteUrl(req, '/search')}?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

module.exports = {
  absoluteUrl,
  seo,
  breadcrumbLd,
  cityFaqLd,
  organizationLd
};

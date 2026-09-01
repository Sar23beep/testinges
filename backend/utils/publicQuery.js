function publishedFilter(extra = {}) {
  return {
    status: 'published',
    deletedAt: null,
    ageVerified: true,
    consentVerified: true,
    ...extra
  };
}

module.exports = { publishedFilter };

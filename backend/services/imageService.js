const { cloudinary, isConfigured } = require('../config/cloudinary');

function uploadBuffer(buffer, folder = 'veloura/profiles') {
  if (!isConfigured) throw Object.assign(new Error('Cloudinary is not configured.'), { status: 503 });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({
      folder,
      resource_type: 'image',
      transformation: [{ width: 1600, height: 2000, crop: 'limit' }, { quality: 'auto', fetch_format: 'auto' }]
    }, (error, result) => error ? reject(error) : resolve(result));
    stream.end(buffer);
  });
}

async function deleteAsset(publicId) {
  if (String(publicId).startsWith('local-demo/')) return { result: 'local-demo-preserved' };
  if (!isConfigured) throw Object.assign(new Error('Cloudinary is not configured.'), { status: 503 });
  return cloudinary.uploader.destroy(publicId, { resource_type: 'image', invalidate: true });
}

function optimizedUrl(url, width = 800) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_fill,w_${width}/`);
}

module.exports = { uploadBuffer, deleteAsset, optimizedUrl };

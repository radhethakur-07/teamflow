import crypto from 'crypto';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

export const isCloudinaryConfigured = () => {
  return !!(cloudName && apiKey && apiSecret);
};

/**
 * Generate a signed upload signature for secure direct client uploads to Cloudinary
 */
export const generateUploadSignature = ({ folder = 'teamflow/attachments', tags = '' } = {}) => {
  const timestamp = Math.round(new Date().getTime() / 1000);

  if (!isCloudinaryConfigured()) {
    // Development / test simulation
    return {
      cloudName: 'demo',
      apiKey: 'simulated_api_key',
      timestamp,
      folder,
      signature: 'simulated_signature_' + crypto.randomUUID(),
      uploadUrl: 'https://api.cloudinary.com/v1_1/demo/auto/upload',
      isSimulated: true,
    };
  }

  // Real Cloudinary SHA1 signature
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${tags ? `&tags=${tags}` : ''}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');

  return {
    cloudName,
    apiKey,
    timestamp,
    folder,
    signature,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    isSimulated: false,
  };
};

/**
 * Handle server-side upload (base64 or data URI)
 */
export const uploadBase64Asset = async (base64Data, { folder = 'teamflow/uploads' } = {}) => {
  if (!base64Data) {
    throw new Error('No data provided for upload.');
  }

  if (!isCloudinaryConfigured()) {
    // Development fallback: return data URI or safe mock URL
    return {
      url: base64Data.startsWith('data:')
        ? base64Data
        : `https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=60`,
      publicId: `dev_simulated_${Date.now()}`,
      format: 'webp',
      bytes: base64Data.length,
      isSimulated: true,
    };
  }

  // Real Cloudinary upload via REST API
  const formData = new URLSearchParams();
  formData.append('file', base64Data);
  formData.append('api_key', apiKey);
  const timestamp = Math.round(new Date().getTime() / 1000);
  formData.append('timestamp', timestamp.toString());
  formData.append('folder', folder);

  const paramsToSign = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash('sha1').update(paramsToSign).digest('hex');
  formData.append('signature', signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Cloudinary upload failed: ${errorText}`);
  }

  const data = await res.json();
  return {
    url: data.secure_url || data.url,
    publicId: data.public_id,
    format: data.format,
    bytes: data.bytes,
    isSimulated: false,
  };
};

export default {
  isCloudinaryConfigured,
  generateUploadSignature,
  uploadBase64Asset,
};

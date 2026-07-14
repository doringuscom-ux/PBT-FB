const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    if (file.mimetype && file.mimetype.startsWith('video/')) {
        return {
            folder: 'punjabi_film_news/videos',
            resource_type: 'video',
            allowed_formats: ['mp4', 'mov', 'avi', 'mkv', 'webm']
        };
    }
    return {
        folder: 'punjabi_film_news',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
        transformation: [{ width: 1200, height: 800, crop: 'limit' }]
    };
  }
});

const upload = multer({ storage: storage });

/**
 * Helper to upload image from remote URL directly to Cloudinary
 * @param {string} url - The remote image URL
 * @returns {Promise<string>} - The optimized Cloudinary secure URL
 */
const uploadFromUrl = async (url) => {
    try {
        if (!url || typeof url !== 'string') return url;
        // Check if it's already a Cloudinary URL or local path
        if (url.includes('cloudinary.com') || url.startsWith('/uploads/')) return url;
        // Skip YouTube links (already optimized)
        if (url.includes('youtube.com') || url.includes('youtu.be') || url.includes('ytimg.com')) return url;
        // Check if it's a valid remote URL
        if (!url.startsWith('http')) return url;

        const result = await cloudinary.uploader.upload(url, {
            folder: 'punjabi_film_news',
            resource_type: 'auto'
        });
        return result.secure_url;
    } catch (err) {
        console.error("Auto-Cloudinary Upload Failed:", err);
        return url; // Fallback to original URL on failure
    }
};

module.exports = {
  cloudinary,
  upload,
  uploadFromUrl
};

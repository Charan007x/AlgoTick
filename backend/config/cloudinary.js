const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'algotick/notes', // Folder name in Cloudinary
    allowed_formats: ['pdf'],
    resource_type: 'raw', // For non-image files like PDF
    public_id: (req, file) => {
      // Generate unique filename: userId_timestamp_random
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `${req.user.id}_${uniqueSuffix}`;
    }
  }
});

module.exports = { cloudinary, storage };

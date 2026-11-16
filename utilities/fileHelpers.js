const fs = require('fs');
const path = require('path');
const { v2: cloudinary } = require('cloudinary');
const { isDriveEnabled, uploadBufferToDrive, deleteFromDrive } = require('./driveClient');

const isCloudinaryEnabled = () => Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryEnabled()) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

/**
 * Normalize multer file path to forward-slash relative URL path (e.g. "uploads/123-img.png").
 */
const normalizePath = (filePath) => {
    if (!filePath) return '';
    if (/^https?:\/\//i.test(filePath)) return filePath;
    return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
};

/**
 * Persists a multer file to Google Drive (when configured), Cloudinary, or local disk.
 */
const persistUploadedFile = async (file, folder = 'portfolio') => {
    if (!file) return '';
    if (isDriveEnabled() && file.buffer) {
        return uploadBufferToDrive(file);
    }
    if (isCloudinaryEnabled() && file.buffer) {
        const isPdf = file.mimetype === 'application/pdf' || /\.pdf$/i.test(file.originalname || '');
        const resourceType = isPdf ? 'raw' : 'auto';
        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
                { folder, resource_type: resourceType },
                (err, res) => (err ? reject(err) : resolve(res))
            );
            stream.end(file.buffer);
        });
        return result.secure_url;
    }
    return normalizePath(file.path);
};

/**
 * Safely delete a previously uploaded file from Google Drive or local ./uploads.
 */
const removeUploadedFile = (relativePath) => {
    if (!relativePath) return;
    if (relativePath.startsWith('media/drive/')) {
        const fileId = relativePath.replace('media/drive/', '').trim();
        deleteFromDrive(fileId).catch(() => {});
        return;
    }
    if (/^https?:\/\//i.test(relativePath)) return;
    const normalized = normalizePath(relativePath);
    if (!normalized.startsWith('uploads/')) return;
    const fullPath = path.resolve(process.cwd(), normalized);
    fs.unlink(fullPath, () => {});
};

module.exports = {
    normalizePath,
    persistUploadedFile,
    removeUploadedFile
};

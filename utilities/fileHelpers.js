const fs = require('fs');
const path = require('path');

/**
 * Normalize multer file path to forward-slash relative URL path (e.g. "uploads/123-img.png").
 */
const normalizePath = (filePath) => {
    if (!filePath) return '';
    return filePath.replace(/\\/g, '/').replace(/^\.\//, '');
};

/**
 * Safely delete a local uploaded file if it exists inside ./uploads.
 */
const removeUploadedFile = (relativePath) => {
    if (!relativePath) return;
    const normalized = normalizePath(relativePath);
    if (!normalized.startsWith('uploads/')) return;
    const fullPath = path.resolve(process.cwd(), normalized);
    fs.unlink(fullPath, () => {});
};

module.exports = {
    normalizePath,
    removeUploadedFile
};


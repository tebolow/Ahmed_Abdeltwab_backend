const path = require('path');
const multer = require('multer');

const ALLOWED_MIME_PREFIXES = ['image/', 'video/'];
const ALLOWED_EXACT_MIMES = ['application/pdf'];
const ALLOWED_EXTENSIONS = new Set([
    '.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg',
    '.mp4', '.webm', '.mkv', '.mov', '.avi',
    '.pdf'
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads');
    },
    filename: (req, file, cb) => {
        const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        const name = `${Date.now()}-${Math.round(Math.random() * 100000)}-${safeOriginal}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const mimeOk =
        ALLOWED_MIME_PREFIXES.some((prefix) => file.mimetype.startsWith(prefix)) ||
        ALLOWED_EXACT_MIMES.includes(file.mimetype);

    if (mimeOk || ALLOWED_EXTENSIONS.has(ext)) {
        return cb(null, true);
    }
    return cb(new Error(`Unsupported file type: ${file.mimetype || ext}`), false);
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100 MB max per file (supports demo videos)
    }
});

module.exports = upload;

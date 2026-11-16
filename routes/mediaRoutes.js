const express = require('express');
const router = express.Router();
const { getDriveFileStream } = require('../utilities/driveClient');

router.get('/drive/:fileId', async (req, res) => {
    try {
        const { fileId } = req.params;
        const { meta, stream } = await getDriveFileStream(fileId);

        if (meta.mimeType) {
            res.setHeader('Content-Type', meta.mimeType);
        }
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        stream.on('error', () => {
            if (!res.headersSent) res.status(404).end();
        });
        stream.pipe(res);
    } catch (error) {
        console.error('Drive stream error:', error.message);
        res.status(404).json({ msg: 'fail', error: 'Media not found' });
    }
});

module.exports = router;


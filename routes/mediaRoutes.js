const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { isDriveEnabled, getAccessToken, makeFilePublic, getDriveFileStream } = require('../utilities/driveClient');

router.get('/drive-token', authMiddleware, async (req, res) => {
    try {
        if (!isDriveEnabled()) {
            return res.status(200).json({ enabled: false });
        }
        const accessToken = await getAccessToken();
        res.status(200).json({
            enabled: true,
            accessToken,
            folderId: (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim()
        });
    } catch (error) {
        console.error('Drive token error:', error.message);
        res.status(500).json({ msg: 'fail', error: 'Failed to obtain Drive upload token' });
    }
});

router.post('/drive-public/:fileId', authMiddleware, async (req, res) => {
    try {
        await makeFilePublic(req.params.fileId);
        res.status(200).json({ msg: 'success' });
    } catch (error) {
        res.status(500).json({ msg: 'fail', error: 'Failed to set file permissions' });
    }
});

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

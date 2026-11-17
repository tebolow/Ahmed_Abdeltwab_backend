const { Readable } = require('stream');

const isDriveEnabled = () => Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
);

let cachedToken = null;
let tokenExpiresAt = 0;

const getAccessToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_DRIVE_CLIENT_ID,
        client_secret: process.env.GOOGLE_DRIVE_CLIENT_SECRET,
        refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
        grant_type: 'refresh_token'
    });

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    const data = await res.json();
    if (!res.ok || !data.access_token) {
        throw new Error(data.error_description || data.error || 'Failed to refresh Google Drive token');
    }

    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + Math.max((data.expires_in || 3600) - 60, 60) * 1000;
    return cachedToken;
};

const uploadBufferToDrive = async (file) => {
    const token = await getAccessToken();
    const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();
    const metadata = {
        name: `${Date.now()}-${(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        ...(folderId ? { parents: [folderId] } : {})
    };

    const boundary = `----portfolioDriveBoundary${Date.now()}`;
    const mimeType = file.mimetype || 'application/octet-stream';

    const headerPart = Buffer.from(
        `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
        `--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
        'utf8'
    );
    const footerPart = Buffer.from(`\r\n--${boundary}--`, 'utf8');
    const bodyBuffer = Buffer.concat([headerPart, file.buffer, footerPart]);

    const uploadRes = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary=${boundary}`,
                'Content-Length': String(bodyBuffer.length)
            },
            body: bodyBuffer
        }
    );

    const created = await uploadRes.json();
    if (!uploadRes.ok || !created.id) {
        throw new Error(created?.error?.message || 'Google Drive upload failed');
    }

    await fetch(`https://www.googleapis.com/drive/v3/files/${created.id}/permissions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' })
    }).catch(() => {});

    return `media/drive/${created.id}`;
};

const deleteFromDrive = async (fileId) => {
    if (!fileId || !isDriveEnabled()) return;
    const token = await getAccessToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    }).catch(() => {});
};

const getDriveFileStream = async (fileId) => {
    const token = await getAccessToken();
    const encodedId = encodeURIComponent(fileId);

    const metaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodedId}?fields=name,mimeType,size`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!metaRes.ok) {
        throw new Error('Failed to fetch Drive file metadata');
    }
    const meta = await metaRes.json();

    const mediaRes = await fetch(
        `https://www.googleapis.com/drive/v3/files/${encodedId}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!mediaRes.ok || !mediaRes.body) {
        throw new Error('Failed to stream Drive file');
    }

    return {
        meta,
        stream: Readable.fromWeb(mediaRes.body)
    };
};

const makeFilePublic = async (fileId) => {
    if (!fileId || !isDriveEnabled()) return;
    const token = await getAccessToken();
    await fetch(`https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: 'reader', type: 'anyone' })
    }).catch(() => {});
};

module.exports = {
    isDriveEnabled,
    getAccessToken,
    makeFilePublic,
    uploadBufferToDrive,
    deleteFromDrive,
    getDriveFileStream
};

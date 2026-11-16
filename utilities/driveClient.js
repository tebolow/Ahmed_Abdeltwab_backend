const { Readable } = require('stream');
const { google } = require('googleapis');

const isDriveOAuthEnabled = () => Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_ID &&
    process.env.GOOGLE_DRIVE_CLIENT_SECRET &&
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN
);

const isDriveServiceAccountEnabled = () => Boolean(
    process.env.GOOGLE_DRIVE_CLIENT_EMAIL &&
    process.env.GOOGLE_DRIVE_PRIVATE_KEY
);

const isDriveEnabled = () => isDriveOAuthEnabled() || isDriveServiceAccountEnabled();

let cachedDrive = null;

const getDriveClient = () => {
    if (cachedDrive) return cachedDrive;

    if (isDriveOAuthEnabled()) {
        const oauth2 = new google.auth.OAuth2(
            process.env.GOOGLE_DRIVE_CLIENT_ID,
            process.env.GOOGLE_DRIVE_CLIENT_SECRET
        );
        oauth2.setCredentials({
            refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN
        });
        cachedDrive = google.drive({ version: 'v3', auth: oauth2 });
        return cachedDrive;
    }

    if (isDriveServiceAccountEnabled()) {
        const auth = new google.auth.JWT({
            email: process.env.GOOGLE_DRIVE_CLIENT_EMAIL,
            key: process.env.GOOGLE_DRIVE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            scopes: ['https://www.googleapis.com/auth/drive']
        });
        cachedDrive = google.drive({ version: 'v3', auth });
        return cachedDrive;
    }

    return null;
};

const uploadBufferToDrive = async (file) => {
    const drive = getDriveClient();
    if (!drive) {
        throw new Error('Google Drive is not configured');
    }

    const folderId = (process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();
    const requestBody = {
        name: `${Date.now()}-${(file.originalname || 'file').replace(/[^a-zA-Z0-9._-]/g, '_')}`,
        ...(folderId ? { parents: [folderId] } : {})
    };

    const created = await drive.files.create({
        requestBody,
        media: {
            mimeType: file.mimetype || 'application/octet-stream',
            body: Readable.from(file.buffer)
        },
        fields: 'id'
    });

    const fileId = created.data.id;
    await drive.permissions.create({
        fileId,
        requestBody: { role: 'reader', type: 'anyone' }
    }).catch(() => {});

    return `media/drive/${fileId}`;
};

const deleteFromDrive = async (fileId) => {
    const drive = getDriveClient();
    if (!drive || !fileId) return;
    await drive.files.delete({ fileId }).catch(() => {});
};

const getDriveFileStream = async (fileId) => {
    const drive = getDriveClient();
    if (!drive) {
        throw new Error('Google Drive is not configured');
    }

    const meta = await drive.files.get({
        fileId,
        fields: 'name, mimeType, size'
    });

    const mediaRes = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
    );

    return {
        meta: meta.data,
        stream: mediaRes.data
    };
};

module.exports = {
    isDriveEnabled,
    uploadBufferToDrive,
    deleteFromDrive,
    getDriveFileStream
};


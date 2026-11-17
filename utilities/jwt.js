const crypto = require('crypto');

const base64UrlEncode = (input) => {
    const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), 'utf8');
    return buf.toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

const base64UrlDecode = (str) => {
    const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4);
    return Buffer.from(padded, 'base64').toString('utf8');
};

const parseExpiresInSeconds = (expiresIn) => {
    if (typeof expiresIn === 'number') return expiresIn;
    const match = /^(\d+)([smhd])$/i.exec(String(expiresIn || '7d').trim());
    if (!match) return 7 * 24 * 60 * 60;
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();
    if (unit === 's') return value;
    if (unit === 'm') return value * 60;
    if (unit === 'h') return value * 3600;
    return value * 86400;
};

const signJwt = (payload, secret, options = {}) => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + parseExpiresInSeconds(options.expiresIn || '7d');
    const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const body = base64UrlEncode(JSON.stringify({ ...payload, iat: now, exp }));
    const signingInput = `${header}.${body}`;
    const signature = base64UrlEncode(
        crypto.createHmac('sha256', secret).update(signingInput).digest()
    );
    return `${signingInput}.${signature}`;
};

const verifyJwt = (token, secret) => {
    const parts = String(token || '').split('.');
    if (parts.length !== 3) {
        throw new Error('Malformed token');
    }
    const [header, body, signature] = parts;
    const signingInput = `${header}.${body}`;
    const expectedSig = base64UrlEncode(
        crypto.createHmac('sha256', secret).update(signingInput).digest()
    );

    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        throw new Error('Invalid token signature');
    }

    const decoded = JSON.parse(base64UrlDecode(body));
    if (decoded.exp && Math.floor(Date.now() / 1000) > decoded.exp) {
        throw new Error('Token expired');
    }
    return decoded;
};

module.exports = { signJwt, verifyJwt };

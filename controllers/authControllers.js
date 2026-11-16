const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Admin = require('../models/authorization');
const msgs = require('../utilities/responseMessages');

const hashPassword = (password) => {
    const salt = crypto.randomBytes(16).toString('hex');
    const derived = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${derived}`;
};

const verifyPassword = (password, storedHash) => {
    const [salt, key] = (storedHash || '').split(':');
    if (!salt || !key) return false;
    const derived = crypto.scryptSync(password, salt, 64);
    const keyBuffer = Buffer.from(key, 'hex');
    if (derived.length !== keyBuffer.length) return false;
    return crypto.timingSafeEqual(derived, keyBuffer);
};

/**
 * Seeds an initial admin account from environment variables if no admin exists.
 */
const seedInitialAdmin = async () => {
    const count = await Admin.countDocuments();
    if (count > 0) return;

    const key = process.env.ADMIN_KEY;
    const password = process.env.ADMIN_PASSWORD;
    if (!key || !password) {
        console.warn('No admin found and ADMIN_KEY / ADMIN_PASSWORD are not set in .env');
        return;
    }

    await Admin.create({
        key,
        password: hashPassword(password)
    });
    console.log(`Initial admin account seeded for key "${key}"`);
};

const login = async (req, res) => {
    try {
        const { key, password } = req.body;
        if (!key || !password) {
            return res.status(400).json({
                msg: msgs.FAIL,
                error: 'Username/key and password are required'
            });
        }

        const admin = await Admin.findOne({ key: key.trim() });
        if (!admin || !verifyPassword(password, admin.password)) {
            return res.status(401).json({
                msg: msgs.FAIL,
                error: 'Invalid credentials'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                msg: msgs.FAIL,
                error: 'JWT_SECRET is not configured'
            });
        }

        const token = jwt.sign(
            { id: admin._id, key: admin.key },
            secret,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(200).json({
            msg: msgs.SUCESS,
            token,
            key: admin.key
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Login failed'
        });
    }
};

const verifySession = (req, res) => {
    res.status(200).json({
        msg: msgs.SUCESS,
        admin: req.admin
    });
};

module.exports = {
    seedInitialAdmin,
    login,
    verifySession
};


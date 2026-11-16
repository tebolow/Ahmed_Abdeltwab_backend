const jwt = require('jsonwebtoken');
const msgs = require('../utilities/responseMessages');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        if (!token) {
            return res.status(401).json({
                msg: msgs.FAIL,
                error: 'Authentication token is required'
            });
        }

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({
                msg: msgs.FAIL,
                error: 'JWT_SECRET is not configured on the server'
            });
        }

        const decoded = jwt.verify(token, secret);
        req.admin = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            msg: msgs.FAIL,
            error: 'Invalid or expired token'
        });
    }
};

module.exports = authMiddleware;


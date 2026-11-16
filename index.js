const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const DBConnect = require('./utilities/configurations/DBConfigurations');
const { seedInitialAdmin } = require('./controllers/authControllers');
const authRoutes = require('./routes/authRoutes');
const dataRoutes = require('./routes/dataRoutes');
const contactRoutes = require('./routes/contactRoutes');
const projectRoutes = require('./routes/projectRoutes');
const socialRoutes = require('./routes/socialRoutes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();
app.set('trust proxy', 1);

const uploadsDir = path.resolve(process.cwd(), 'uploads');
if (!process.env.VERCEL && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

const allowedOrigins = [process.env.ADMIN, process.env.USER]
    .concat((process.env.CORS_ORIGINS || '').split(','))
    .map((origin) => (origin || '').trim())
    .filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

let seededOnce = false;
app.use(async (req, res, next) => {
    try {
        await DBConnect();
        if (!seededOnce) {
            await seedInitialAdmin();
            seededOnce = true;
        }
        next();
    } catch (err) {
        next(err);
    }
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'fail', error: 'Too many login attempts, please try again later.' }
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { msg: 'fail', error: 'Too many contact messages sent. Please try again later.' }
});

if (!process.env.VERCEL) {
    app.use('/uploads', express.static(uploadsDir));
}
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.use('/auth/login', authLimiter);
app.use('/contacts/addContact', contactLimiter);

app.use('/auth', authRoutes);
app.use('/data', dataRoutes);
app.use('/contacts', contactRoutes);
app.use('/projects', projectRoutes);
app.use('/socials', socialRoutes);
app.use('/media', mediaRoutes);

app.use((err, req, res, next) => {
    if (err) {
        return res.status(400).json({
            msg: 'fail',
            error: err.message || 'Request failed'
        });
    }
    next();
});

const port = process.env.PORT || 2300;

if (!process.env.VERCEL) {
    (async function startServer() {
        await DBConnect();
        await seedInitialAdmin();
        seededOnce = true;
        app.listen(port, () => {
            console.log(`Server started on port ${port} (${process.env.NODE_ENV || 'development'})`);
        });
    })();
}

module.exports = app;

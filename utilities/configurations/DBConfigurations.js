const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

let cachedPromise = null;

const connectDB = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }
    if (!cachedPromise) {
        cachedPromise = mongoose.connect(process.env.DB).then((m) => {
            console.log('DB is connected');
            return m.connection;
        }).catch((err) => {
            cachedPromise = null;
            throw err;
        });
    }
    return cachedPromise;
};

module.exports = connectDB;

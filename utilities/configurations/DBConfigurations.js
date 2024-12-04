const mongoose = require(`mongoose`);
const dotenv = require(`dotenv`);
dotenv.config();

const connectDB = async _=>{
    await mongoose.connect(process.env.DB);
    console.log(`DB is connected`);
}

module.exports = connectDB;
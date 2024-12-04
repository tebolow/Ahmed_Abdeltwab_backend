const mongoose = require(`mongoose`);

const dataSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    availability: {
        type: String,
        required: true
    },
    about: {
        type: String,
        required: true
    },
    homeImage: {
        type: String,
        required: true
    },
    aboutImage: {
        type: String,
        required: true
    },
});

const Data = mongoose.model(`Data`, dataSchema);
module.exports = Data
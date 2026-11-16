const mongoose = require('mongoose');

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
        default: ''
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
        default: ''
    },
    aboutImage: {
        type: String,
        default: ''
    },
    cv: {
        type: String,
        default: ''
    },
    toolkit: {
        type: [String],
        default: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git']
    },
    portfolioFilters: {
        type: [String],
        default: ['All', 'Web', 'Mobile', 'Desktop', 'AI']
    }
});

const Data = mongoose.model('Data', dataSchema);
module.exports = Data;

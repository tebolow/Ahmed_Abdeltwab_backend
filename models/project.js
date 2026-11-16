const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    brief: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumb: {
        type: String,
        required: true
    },
    imgs: {
        type: [String],
        default: []
    },
    video: {
        type: String,
        default: ''
    },
    category: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;

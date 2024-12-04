const mongoose = require(`mongoose`);

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
        required: true
    },
    video: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    skills: {
        type: [String],
        required: true
    }
})

const Project = mongoose.model(`Project`, projectSchema);

module.exports = Project;
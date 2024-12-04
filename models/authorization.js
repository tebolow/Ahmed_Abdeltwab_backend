const mongoose = require(`mongoose`);

const adminSchema = mongoose.Schema({
    key: {
        type: String,
        requried: true
    },
    password: {
        type: String,
        required: true
    }
});

const Admin = mongoose.model(`Admin`, adminSchema);

module.exports = Admin;
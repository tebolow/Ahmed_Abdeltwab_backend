const mongoose = require(`mongoose`);

const socialSchema = new mongoose.Schema({
    name: String,
    icon: {
        type: String,
        required: true
    },
    link: {
        type: String,
        required: true
    }
});

const Social = mongoose.model(`Social`, socialSchema);

module.exports = Social;
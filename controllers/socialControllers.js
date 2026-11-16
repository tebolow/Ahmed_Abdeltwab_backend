const Social = require('../models/social');
const msgs = require('../utilities/responseMessages');

const addSocial = async (req, res) => {
    try {
        const created = await Social.create(req.body);
        res.status(201).json({
            msg: msgs.SUCESS,
            data: created
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to add social link'
        });
    }
};

const getSocials = async (req, res) => {
    try {
        const socials = await Social.find();
        res.status(200).json({
            msg: msgs.SUCESS,
            data: socials
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to fetch social links'
        });
    }
};

const updateSocial = async (req, res) => {
    try {
        const updated = await Social.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Social link not found'
            });
        }
        res.status(200).json({
            msg: msgs.SUCESS,
            data: updated
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: error.message || 'Failed to update social link'
        });
    }
};

const deleteSocial = async (req, res) => {
    try {
        const deleted = await Social.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                msg: msgs.FAIL,
                error: 'Social link not found'
            });
        }
        res.status(200).json({
            msg: msgs.SUCESS,
            data: deleted
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            error: 'Failed to delete social link'
        });
    }
};

module.exports = {
    addSocial,
    getSocials,
    updateSocial,
    deleteSocial
};

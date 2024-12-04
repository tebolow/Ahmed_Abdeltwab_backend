const Social = require(`./../models/social`);
const msgs = require(`./../utilities/responseMessages`);

const addSocial = async (req, res) => {
    try {
        let newSocial = req.body;
        await Social.create(newSocial);
        res.status(200).json({
            msg: msgs.SUCESS,
            data: newSocial
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

const getSocials = async (req, res) => {
    try {
        let socials = await Social.find();
        res.status(200).json({
            msg: msgs.SUCESS,
            data: socials
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

module.exports = {
    addSocial,
    getSocials,
    
}
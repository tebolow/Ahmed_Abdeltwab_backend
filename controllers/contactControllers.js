const Contact = require(`./../models/contact`);
const msgs = require(`./../utilities/responseMessages`);

const addContact = async (req, res) => {
    try {
        let newContact = req.body;
        await Contact.create(newContact);
        res.status(200).json({
            msg: msgs.SUCESS,
            data: newContact
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: msgs.FAIL,
            Data: error
        })
    }
}

const getContacts = async (req, res) => {
    try {
        let contacts = await Contact.find();
        res.status(200).json({
            msg: msgs.SUCESS,
            data: contacts
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
    addContact,
    getContacts
}
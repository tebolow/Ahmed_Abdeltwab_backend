const express = require('express');
const router = express.Router();
const contactControllers = require('../controllers/contactControllers');
const multer = require('../utilities/configurations/multerConfigurations');
const authMiddleware = require('../middlewares/authMiddleware');

router
    .post('/addContact', multer.none(), contactControllers.addContact)
    .get('/getContacts', authMiddleware, contactControllers.getContacts)
    .delete('/deleteContact/:id', authMiddleware, contactControllers.deleteContact);

module.exports = router;

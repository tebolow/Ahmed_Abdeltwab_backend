const express = require(`express`);
const router = express.Router();
const contactControllers = require(`./../controllers/contactControllers`);
const multer = require(`./../utilities/configurations/multerConfigurations`);

router.post(`/addContact`, multer.none(), contactControllers.addContact)
.get(`/getContacts`, contactControllers.getContacts);

module.exports = router;
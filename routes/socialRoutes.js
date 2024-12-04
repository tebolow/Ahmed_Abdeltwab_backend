const express = require(`express`);
const router = express.Router();
const socialControllers = require(`./../controllers/socialControllers`);
const upload = require(`./../utilities/configurations/multerConfigurations`);

router.post(`/addSocial`, upload.none(), socialControllers.addSocial)
.get(`/getSocials`, socialControllers.getSocials)

module.exports = router;
const express = require(`express`);
const router = express.Router();
const dataControllers = require(`./../controllers/dataControllers`);
const upload = require(`./../utilities/configurations/multerConfigurations`);

router.get(`/getData`, dataControllers.getData)
.post(`/editData`, upload.fields([
    {name: `logo`},
    {name: `homeImage`},
    {name: `aboutImage`}
]), dataControllers.editData)

module.exports = router
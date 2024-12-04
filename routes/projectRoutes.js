const express = require(`express`);
const router = express.Router();
const projectControllers = require(`./../controllers/projectControllers`);
const upload = require(`./../utilities/configurations/multerConfigurations`);

router.post(`/addProject`, upload.fields([
    {name: `thumb`, maxCount: 1},
    {name: `imgs`, maxCount: 15},
    {name: `video`, maxCount: 1}
]), projectControllers.addProject)
.get(`/getProjects`, projectControllers.getProjects)

module.exports = router;
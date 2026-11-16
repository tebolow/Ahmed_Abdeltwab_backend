const express = require('express');
const router = express.Router();
const projectControllers = require('../controllers/projectControllers');
const upload = require('../utilities/configurations/multerConfigurations');
const authMiddleware = require('../middlewares/authMiddleware');

const projectUpload = upload.fields([
    { name: 'thumb', maxCount: 1 },
    { name: 'imgs', maxCount: 15 },
    { name: 'video', maxCount: 1 }
]);

router
    .get('/getProjects', projectControllers.getProjects)
    .get('/getProject/:id', projectControllers.getProjectById)
    .post('/addProject', authMiddleware, projectUpload, projectControllers.addProject)
    .put('/updateProject/:id', authMiddleware, projectUpload, projectControllers.updateProject)
    .delete('/deleteProject/:id', authMiddleware, projectControllers.deleteProject);

module.exports = router;

const express = require('express');
const router = express.Router();
const dataControllers = require('../controllers/dataControllers');
const upload = require('../utilities/configurations/multerConfigurations');
const authMiddleware = require('../middlewares/authMiddleware');

router
    .get('/getData', dataControllers.getData)
    .get('/downloadCv', dataControllers.downloadCv)
    .put('/updateFilters', authMiddleware, dataControllers.updateFilters)
    .post(
        '/editData',
        authMiddleware,
        upload.fields([
            { name: 'logo', maxCount: 1 },
            { name: 'homeImage', maxCount: 1 },
            { name: 'aboutImage', maxCount: 1 },
            { name: 'cv', maxCount: 1 }
        ]),
        dataControllers.editData
    );

module.exports = router;

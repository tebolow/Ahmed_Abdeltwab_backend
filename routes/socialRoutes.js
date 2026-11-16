const express = require('express');
const router = express.Router();
const socialControllers = require('../controllers/socialControllers');
const upload = require('../utilities/configurations/multerConfigurations');
const authMiddleware = require('../middlewares/authMiddleware');

router
    .get('/getSocials', socialControllers.getSocials)
    .post('/addSocial', authMiddleware, upload.none(), socialControllers.addSocial)
    .put('/updateSocial/:id', authMiddleware, upload.none(), socialControllers.updateSocial)
    .delete('/deleteSocial/:id', authMiddleware, socialControllers.deleteSocial);

module.exports = router;

const express = require('express');
const router = express.Router();
const authControllers = require('../controllers/authControllers');
const authMiddleware = require('../middlewares/authMiddleware');

router
    .post('/login', authControllers.login)
    .get('/verify', authMiddleware, authControllers.verifySession);

module.exports = router;


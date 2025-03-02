const express = require('express');
const router = express.Router();
const authController = require('../Controllers/authController.js');
const auth = require('../middleware/auth');

// Register user
router.post('/register', authController.register);

// Login user
router.post('/login', authController.login);



module.exports = router;
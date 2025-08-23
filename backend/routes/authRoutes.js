const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Add this new route
router.post('/register', authController.register);  // 👈 New line
router.post('/login', authController.login);
router.get('/me', authMiddleware.protect, authController.getMe);

module.exports = router;
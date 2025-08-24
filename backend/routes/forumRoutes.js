// routes/forumRoutes.js
const express = require('express');
const router = express.Router();
const forumController = require('../controllers/forumController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

router.get('/posts', forumController.getPosts);
router.post('/posts', forumController.createPost);
router.get('/posts/:id', forumController.getPost);
router.post('/posts/:id/replies', forumController.addReply);

module.exports = router;
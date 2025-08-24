// routes/githubRoutes.js
const express = require('express');
const router = express.Router();
const githubController = require('../controllers/githubController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

router.post('/connect', githubController.connectGithub);
router.get('/repos', githubController.getRepositories);
router.get('/repos/:owner/:repo/issues', githubController.getIssues);
router.post('/repos/:owner/:repo/issues', githubController.createIssue);

module.exports = router;
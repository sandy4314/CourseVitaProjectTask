const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Admin only routes
router.post('/', authMiddleware.restrictTo('admin'), taskController.createTask);

// All authenticated users
router.get('/', taskController.getTasks);
router.get('/status', taskController.getTaskStats);
router.put('/:id/status', taskController.updateTaskStatus);

// Task timer routes (employee only)
router.post('/:id/start', authMiddleware.restrictTo('employee'), taskController.startTask);
router.post('/:id/break', authMiddleware.restrictTo('employee'), taskController.takeBreak);
router.post('/:id/resume', authMiddleware.restrictTo('employee'), taskController.resumeTask);
router.post('/:id/endday', authMiddleware.restrictTo('employee'), taskController.endTaskDay);

// Time tracking details (accessible to both admin and employee)
router.get('/:id/time', taskController.getTaskTimeDetails);

module.exports = router;
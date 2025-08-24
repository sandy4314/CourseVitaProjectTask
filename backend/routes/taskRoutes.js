const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
// taskRoutes.js - Correct order:

// Protect all routes
router.use(authMiddleware.protect);

// Admin only routes
router.post('/', authMiddleware.restrictTo('admin'), taskController.createTask);

// All authenticated users - PUT SPECIFIC ROUTES FIRST
router.put('/:id/time-entries/:entryId/description', taskController.updateTimeEntryDescription);
router.get('/:id/time', taskController.getTaskTimeDetails);
router.get('/weekly-report/:employeeId', taskController.getWeeklyReport);

// THEN add the generic routes
router.get('/', taskController.getTasks);
router.get('/status', taskController.getTaskStats);
router.put('/:id/status', taskController.updateTaskStatus);
router.get('/:id', taskController.getTaskById); // This should be LAST

// Task timer routes (employee only)
router.post('/:id/start', authMiddleware.restrictTo('employee'), taskController.startTask);
router.post('/:id/break', authMiddleware.restrictTo('employee'), taskController.takeBreak);
router.post('/:id/resume', authMiddleware.restrictTo('employee'), taskController.resumeTask);
router.post('/:id/endday', authMiddleware.restrictTo('employee'), taskController.endTaskDay);

module.exports = router;
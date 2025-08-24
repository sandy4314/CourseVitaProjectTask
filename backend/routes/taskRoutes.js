// taskRoutes.js - Correct order:
const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// SPECIFIC ROUTES FIRST
router.get('/weekly-report/:employeeId', taskController.getWeeklyReport);
router.put('/:id/time-entries/:entryId/description', taskController.updateTimeEntryDescription);
router.get('/:id/time', taskController.getTaskTimeDetails);

// THEN generic routes
router.get('/', taskController.getTasks);
router.post('/', authMiddleware.restrictTo('admin'), taskController.createTask);
router.get('/status', taskController.getTaskStats);
router.put('/:id/status', taskController.updateTaskStatus);
router.get('/:id', taskController.getTaskById); // This should be LAST
// In taskRoutes.js
router.get('/debug/time-entries/:employeeId', taskController.debugTimeEntries);

// Task timer routes
router.post('/:id/start', authMiddleware.restrictTo('employee'), taskController.startTask);
router.post('/:id/break', authMiddleware.restrictTo('employee'), taskController.takeBreak);
router.post('/:id/resume', authMiddleware.restrictTo('employee'), taskController.resumeTask);
router.post('/:id/endday', authMiddleware.restrictTo('employee'), taskController.endTaskDay);

module.exports = router;
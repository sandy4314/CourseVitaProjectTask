// employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Employee can access their own profile (add this BEFORE admin restriction)
router.get('/my-profile', employeeController.getMyProfile);

// Admin only routes
router.use(authMiddleware.restrictTo('admin'));

router.route('/')
  .get(employeeController.getEmployees)
  .post(employeeController.createEmployee);

router.route('/:id')
  .get(employeeController.getOneEmployee)
  .put(employeeController.updateEmployee)
  .delete(employeeController.deleteEmployee);

module.exports = router;
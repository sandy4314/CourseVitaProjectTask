// routes/chatRoutes.js - Add new endpoint
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

// Protect all routes
router.use(authMiddleware.protect);

// Existing routes
router.get('/messages', chatController.getMessages);
router.post('/messages', chatController.sendMessage);
router.get('/rooms', chatController.getRooms);

router.get('/users', async (req, res) => {
  try {
    const Employee = require('../models/Employee');
    const Task = require('../models/Task');
    
    // For admins: return all employees
    if (req.user.role === 'admin') {
      try {
        const employees = await Employee.find().select('username fullName employeeId');
        return res.json(employees);
      } catch (adminError) {
        console.error('Error fetching all employees:', adminError);
        return res.status(500).json({ message: 'Error fetching employees' });
      }
    }
    
    // For employees: return users they have interacted with
    try {
      // Get tasks where the current user is involved
      const tasks = await Task.find({
        $or: [
          { assignedTo: req.user.id },
          { assignedBy: req.user.id }
        ]
      })
      .populate('assignedTo', 'username fullName employeeId')
      .populate('assignedBy', 'username fullName employeeId');

      const uniqueUsers = new Map();
      
      // Add users from tasks
      tasks.forEach(task => {
        if (task.assignedTo && task.assignedTo._id) {
          const userId = task.assignedTo._id.toString();
          uniqueUsers.set(userId, {
            _id: task.assignedTo._id,
            username: task.assignedTo.username,
            fullName: task.assignedTo.fullName || task.assignedTo.username,
            employeeId: task.assignedTo.employeeId
          });
        }
        
        if (task.assignedBy && task.assignedBy._id) {
          const userId = task.assignedBy._id.toString();
          uniqueUsers.set(userId, {
            _id: task.assignedBy._id,
            username: task.assignedBy.username,
            fullName: task.assignedBy.fullName || task.assignedBy.username,
            employeeId: task.assignedBy.employeeId
          });
        }
      });
      
      // Also include all admins (so employees can message admins)
      try {
        const admins = await Employee.find({ role: 'admin' }).select('username fullName employeeId');
        admins.forEach(admin => {
          uniqueUsers.set(admin._id.toString(), {
            _id: admin._id,
            username: admin.username,
            fullName: admin.fullName || admin.username,
            employeeId: admin.employeeId
          });
        });
      } catch (adminError) {
        console.log('Could not fetch admins for chat users:', adminError);
      }
      
      // Convert map to array
      const usersList = Array.from(uniqueUsers.values());
      
      res.json(usersList);
    } catch (taskError) {
      console.error('Error fetching tasks for chat users:', taskError);
      return res.status(500).json({ message: 'Error fetching team members' });
    }
  } catch (err) {
    console.error('Error in /chat/users endpoint:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
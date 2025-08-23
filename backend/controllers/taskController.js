const Task = require('../models/Task');
const Employee = require('../models/Employee');

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getTasks = async (req, res) => {
  try {
    let query = {};
    
    // If user is employee, only show their tasks
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ username: req.user.username });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      query.assignedTo = employee._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'fullName employeeId')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private (Admin only)
exports.createTask = async (req, res) => {
  const { title, description, assignedTo, category, dueDate } = req.body;

  try {
    // Find employee by username
    const employee = await Employee.findOne({ username: assignedTo });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const task = new Task({
      title,
      description,
      assignedTo: employee._id,
      assignedBy: req.user.id,
      category,
      dueDate
    });

    await task.save();
    res.status(201).json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update task status
// @route   PUT /api/tasks/:id/status
// @access  Private
exports.updateTaskStatus = async (req, res) => {
  const { status } = req.body;

  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // If user is employee, verify they are assigned to this task
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ username: req.user.username });
      if (!employee || !task.assignedTo.equals(employee._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    task.status = status;
    task.updatedAt = Date.now();
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task statistics
// @route   GET /api/tasks/stats
// @access  Private
exports.getTaskStats = async (req, res) => {
  try {
    let match = {};
    
    // If user is employee, only count their tasks
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ username: req.user.username });
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      match.assignedTo = employee._id;
    }

    const stats = await Task.aggregate([
      { $match: match },
      { $group: { 
        _id: '$status', 
        count: { $sum: 1 }
      }}
    ]);

    // Format the response
    const result = {
      new: 0,
      active: 0,
      completed: 0,
      failed: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.count;
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add these new methods to your existing taskController.js

// @desc    Start working on a task
// @route   POST /api/tasks/:id/start
// @access  Private
exports.startTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify employee is assigned to this task
    const employee = await Employee.findOne({ username: req.user.username });
    if (!employee || !task.assignedTo.equals(employee._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if there's an active time entry without endTime
    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (activeEntry) {
      return res.status(400).json({ message: 'Task is already in progress' });
    }

    // Create new time entry
    const newEntry = {
      startTime: new Date(),
      description: 'Started working on the task'
    };

    task.timeEntries.push(newEntry);
    task.status = 'active';
    await task.save();

    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Take a break from task
// @route   POST /api/tasks/:id/break
// @access  Private
exports.takeBreak = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify employee is assigned to this task
    const employee = await Employee.findOne({ username: req.user.username });
    if (!employee || !task.assignedTo.equals(employee._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find the active time entry
    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) {
      return res.status(400).json({ message: 'No active task session found' });
    }

    // Check if there's already an active break
    const activeBreak = activeEntry.breaks.find(b => !b.end);
    if (activeBreak) {
      return res.status(400).json({ message: 'Break is already in progress' });
    }

    // Start new break
    activeEntry.breaks.push({
      start: new Date()
    });

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    End break and resume task
// @route   POST /api/tasks/:id/resume
// @access  Private
exports.resumeTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify employee is assigned to this task
    const employee = await Employee.findOne({ username: req.user.username });
    if (!employee || !task.assignedTo.equals(employee._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find the active time entry
    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) {
      return res.status(400).json({ message: 'No active task session found' });
    }

    // Find the active break
    const activeBreak = activeEntry.breaks.find(b => !b.end);
    if (!activeBreak) {
      return res.status(400).json({ message: 'No active break found' });
    }

    // End the break
    activeBreak.end = new Date();
    activeBreak.duration = Math.round((activeBreak.end - activeBreak.start) / (1000 * 60)); // in minutes

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    End work day for task
// @route   POST /api/tasks/:id/endday
// @access  Private
exports.endTaskDay = async (req, res) => {
  try {
    const { description } = req.body;
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify employee is assigned to this task
    const employee = await Employee.findOne({ username: req.user.username });
    if (!employee || !task.assignedTo.equals(employee._id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find the active time entry
    const activeEntry = task.timeEntries.find(entry => !entry.endTime);
    if (!activeEntry) {
      return res.status(400).json({ message: 'No active task session found' });
    }

    // End any active breaks first
    const activeBreak = activeEntry.breaks.find(b => !b.end);
    if (activeBreak) {
      activeBreak.end = new Date();
      activeBreak.duration = Math.round((activeBreak.end - activeBreak.start) / (1000 * 60));
    }

    // End the time entry
    activeEntry.endTime = new Date();
    activeEntry.description = description || 'Worked on the task';
    
    // Calculate total duration (subtracting break times)
    const totalWorkedMs = activeEntry.endTime - activeEntry.startTime;
    const totalBreakMs = activeEntry.breaks.reduce((total, b) => total + (b.duration * 60 * 1000), 0);
    activeEntry.totalDuration = Math.round((totalWorkedMs - totalBreakMs) / (1000 * 60));

    await task.save();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get task time tracking details
// @route   GET /api/tasks/:id/time
// @access  Private
exports.getTaskTimeDetails = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'fullName employeeId');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Verify user has access to this task
    if (req.user.role === 'employee') {
      const employee = await Employee.findOne({ username: req.user.username });
      if (!employee || !task.assignedTo.equals(employee._id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    res.json({
      task: {
        _id: task._id,
        title: task.title,
        status: task.status,
        assignedTo: task.assignedTo
      },
      timeEntries: task.timeEntries,
      totalTimeSpent: task.totalTimeSpent
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
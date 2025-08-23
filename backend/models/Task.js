const mongoose = require('mongoose');

const taskTimeEntrySchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  startTime: { type: Date },
  endTime: { type: Date },
  breaks: [{
    start: { type: Date },
    end: { type: Date },
    duration: { type: Number } // in minutes
  }],
  totalDuration: { type: Number, default: 0 }, // in minutes
  description: { type: String }
}, { _id: false });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: [
      // Your existing enum values
    ],
    default: 'Documentation'
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['new', 'active', 'completed', 'failed'],
    default: 'new'
  },
  timeEntries: [taskTimeEntrySchema],
  totalTimeSpent: { type: Number, default: 0 }, // in minutes
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Add a pre-save hook to update totalTimeSpent
taskSchema.pre('save', function(next) {
  this.totalTimeSpent = this.timeEntries.reduce((total, entry) => total + entry.totalDuration, 0);
  next();
});

module.exports = mongoose.model('Task', taskSchema);
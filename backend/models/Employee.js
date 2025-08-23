const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  domain: {
    type: String,
    required: true,
    enum: ['Design', 'Development', 'Data Analyst', 'Marketing', 'Testing', 'Support', 'Project Management']
  },
  salary: {
    type: Number,
    required: true
  },
  position: {
    type: String,
    required: true
  },
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
   password: {
    type: String,
    required: true
  },
  email:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model('Employee', employeeSchema);
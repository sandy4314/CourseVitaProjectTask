const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  console.log('Comparing passwords...');
  console.log('Candidate:', candidatePassword);
  console.log('Stored hash:', this.password);
  
  try {
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    console.log('Comparison result:', isMatch);
    return isMatch;
  } catch (err) {
    console.error('Comparison error:', err);
    return false;
  }
};

// Static method to initialize admin user
userSchema.statics.initAdminUser = async function() {
  const adminUsername = 'admin4314';
  const adminPassword = 'Sandy@1234';
  
  try {
    const existingAdmin = await this.findOne({ username: adminUsername });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await this.create({
        username: adminUsername,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default admin user created');
    }
  } catch (err) {
    console.error('Error creating admin user:', err);
  }
};

module.exports = mongoose.model('User', userSchema);
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function verifyHash() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const admin = await User.findOne({ username: 'admin4314' });
    if (!admin) {
      console.log('Admin user not found');
      return;
    }

    console.log('Stored hash:', admin.password);
    
    // Test with correct password
    const matchCorrect = await bcrypt.compare('Sandy@1234', admin.password);
    console.log('Match with "Sandy@1234":', matchCorrect);
    
    // Test with wrong password
    const matchWrong = await bcrypt.compare('wrongpass', admin.password);
    console.log('Match with "wrongpass":', matchWrong);
    
    // Create new hash for comparison
    const newHash = await bcrypt.hash('Sandy@1234', 10);
    console.log('New hash for same password:', newHash);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

verifyHash();
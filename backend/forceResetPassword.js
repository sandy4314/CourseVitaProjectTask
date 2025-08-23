require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function forceReset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const newHash = await bcrypt.hash('Sandy@1234', 10);
    await User.updateOne(
      { username: 'admin4314' },
      { $set: { password: newHash } }
    );
    
    console.log('✅ Password forcefully reset');
    console.log('New hash:', newHash);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    mongoose.disconnect();
  }
}

forceReset();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

async function updateAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/algotick');
    console.log('Connected to database');

    const hashedPassword = await bcrypt.hash('149597871', 10);
    
    let admin = await User.findOne({ username: 'admin007x' });
    
    if (admin) {
      admin.email = 'admin007x@algotick.com';
      admin.password = hashedPassword;
      admin.role = 'admin';
      await admin.save();
      console.log('✅ Admin account updated');
    } else {
      admin = new User({
        username: 'admin007x',
        email: 'admin007x@algotick.com',
        password: hashedPassword,
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin account created');
    }
    
    // Credentials logged only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== Admin Login Credentials (Development Only) ===');
      console.log('Email: admin007x@algotick.com');
      console.log('Password: 149597871');
      console.log('Username:', admin.username);
      console.log('================================================\n');
    }
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

updateAdmin();

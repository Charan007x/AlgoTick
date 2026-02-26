const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/algotick', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ username: 'admin007x' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('149597871', salt);

    // Create admin user
    const adminUser = new User({
      username: 'admin007x',
      email: 'admin007x@algotick.com',
      password: hashedPassword,
      leetcodeUsername: 'admin007x',
      role: 'admin'
    });

    await adminUser.save();

    console.log('Admin user created successfully!');
    console.log('Username: admin007x');
    console.log('Password: 149597871');
    console.log('Email: admin007x@algotick.com');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

createAdminUser();

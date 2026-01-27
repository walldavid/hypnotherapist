/**
 * Create Admin User Script
 * 
 * Usage:
 *   node scripts/createAdmin.js
 * 
 * This will create an admin user with:
 *   Username: admin
 *   Email: admin@hypnotherapist.ie
 *   Password: Admin123! (CHANGE THIS AFTER FIRST LOGIN)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    // Check if MongoDB URI is configured
    if (!process.env.MONGODB_URI) {
      console.error('❌ Error: MONGODB_URI not configured in .env file');
      console.log('\n📝 To fix this:');
      console.log('1. Install MongoDB locally OR use MongoDB Atlas (cloud)');
      console.log('2. Add MONGODB_URI to your .env file');
      console.log('   Example: MONGODB_URI=mongodb://localhost:27017/hypnotherapist');
      console.log('\n💡 Quick Start with MongoDB:');
      console.log('   - Mac: brew install mongodb-community && brew services start mongodb-community');
      console.log('   - Cloud: https://www.mongodb.com/cloud/atlas (free tier available)');
      process.exit(1);
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\nExisting admin details:');
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log(`  Status: ${existingAdmin.status}`);
      console.log('\n💡 To reset password, delete this user from MongoDB first.');
      
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create new admin user
    const adminData = {
      username: 'admin',
      email: 'admin@hypnotherapist.ie',
      password: 'Admin123!', // This will be hashed by the model
      name: 'System Administrator',
      role: 'superadmin',
      status: 'active'
    };

    console.log('👤 Creating admin user...');
    const admin = new Admin(adminData);
    await admin.save();

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`  URL:      http://localhost:3000/admin/login`);
    console.log(`  Username: ${adminData.username}`);
    console.log(`  Password: ${adminData.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!');
    console.log('   (Password change feature needs to be implemented)\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    process.exit(1);
  }
};

// Run the script
createAdmin();

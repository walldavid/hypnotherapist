/**
 * Create Admin User Script
 *
 * Usage (from server/ directory):
 *   npm run create-admin
 *
 * Creates an admin user with default credentials.
 * CHANGE THE PASSWORD after first login.
 */

const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '..', `.env.${process.env.NODE_ENV || 'development'}`)
});

const admins = require('../collections/admins');

const createAdmin = async () => {
  try {
    if (!process.env.FIRESTORE_PROJECT_ID) {
      console.error('❌ Error: FIRESTORE_PROJECT_ID not configured in .env.development');
      console.log('\n📝 To fix this:');
      console.log('1. Copy server/.env.example to server/.env.development');
      console.log('2. Set FIRESTORE_PROJECT_ID to your GCP project ID');
      console.log('3. For local dev, start the Firestore emulator first:');
      console.log('   firebase emulators:start --only firestore');
      process.exit(1);
    }

    console.log('🔌 Connecting to Firestore...');

    const existingAdmin = await admins.findByUsername('admin');
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists!');
      console.log('\nExisting admin details:');
      console.log(`  Username: ${existingAdmin.username}`);
      console.log(`  Email: ${existingAdmin.email}`);
      console.log(`  Role: ${existingAdmin.role}`);
      console.log(`  Status: ${existingAdmin.status}`);
      console.log('\n💡 To reset password, delete this document from the admins Firestore collection.');
      process.exit(0);
    }

    console.log('👤 Creating admin user...');
    const admin = await admins.create({
      username: 'admin',
      email: 'admin@hypnotherapist.ie',
      password: 'Admin123!',
      name: 'System Administrator',
      role: 'superadmin',
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  URL:      http://localhost:3000/admin/login');
    console.log('  Username: admin');
    console.log('  Password: Admin123!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('⚠️  IMPORTANT: Change this password after first login!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    process.exit(1);
  }
};

createAdmin();

// Run with: node reset-admin.js
// Resets the admin password to: admin123

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin1234@bookstore.7fsfq2u.mongodb.net/bookStoreDB';
const NEW_PASSWORD = 'admin123';

await mongoose.connect(MONGODB_URI);
console.log('✓ Connected to MongoDB');

const Admin = mongoose.model('Admin', new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
}, { timestamps: true }));

// List all admins first
const admins = await Admin.find({});
if (admins.length === 0) {
  console.log('No admin accounts found. Creating one...');
  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  const newAdmin = await Admin.create({
    name: 'Admin',
    email: 'admin@buetiansboighor.com',
    password: hash,
    role: 'admin',
  });
  console.log(`✓ Created admin: ${newAdmin.email}`);
  console.log(`  Password: ${NEW_PASSWORD}`);
} else {
  console.log(`Found ${admins.length} admin account(s):`);
  admins.forEach((a, i) => console.log(`  ${i + 1}. ${a.email} (${a.role})`));

  const hash = await bcrypt.hash(NEW_PASSWORD, 10);
  await Admin.updateMany({}, { password: hash });
  console.log(`\n✓ Password reset for all admins to: ${NEW_PASSWORD}`);
}

await mongoose.disconnect();
console.log('Done.');

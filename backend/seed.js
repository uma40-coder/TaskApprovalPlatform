require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      console.log('Admin already exists:', existing.email);
      process.exit(0);
    }

    const admin = await User.create({
      fullName: 'Platform Admin',
      email: process.env.ADMIN_EMAIL || 'admin@taskplatform.com',
      password: process.env.ADMIN_PASSWORD || 'Admin@123456',
      role: 'admin',
      status: 'approved',
    });

    console.log('✅ Admin created:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
};

seedAdmin();

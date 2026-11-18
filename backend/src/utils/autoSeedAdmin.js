const User = require('../models/User');

const autoSeedAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@taskplatform.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      await User.create({
        fullName: 'Platform Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        status: 'approved',
      });
      console.log(`👑 Auto-seeded default admin: ${adminEmail}`);
    }
  } catch (error) {
    console.error('Failed to auto-seed admin:', error.message);
  }
};

module.exports = autoSeedAdmin;

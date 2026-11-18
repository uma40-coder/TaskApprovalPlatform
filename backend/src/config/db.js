const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/taskplatform';

    // If MONGO_URI is an unconfigured placeholder, fallback to MongoMemoryServer
    if (mongoUri.includes('<username>') || mongoUri.includes('placeholder')) {
      console.log('🔄 Initializing in-memory MongoDB server for fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      process.env.MONGO_URI = mongoUri;
      console.log(`📦 Embedded MongoDB server started at: ${mongoUri}`);
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected to your local machine: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

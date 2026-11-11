const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Disable command buffering so operations fail fast instead of hanging when DB is down
    mongoose.set('bufferCommands', false);
    
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rural-venture';
    console.log(`Attempting to connect to MongoDB at: ${uri}`);
    
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000, // timeout after 3 seconds
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    global.dbConnected = true;
  } catch (error) {
    console.error(`MongoDB Connection Failed: ${error.message}`);
    console.warn(`
======================================================================
WARNING: Local MongoDB is not running or unreachable!
To ensure this college project remains fully testable, the backend
will run using a localized JSON file storage fallback (server/data/).
All logins, signups, products, orders, and reviews will be persisted 
locally. No database setup is required to run the server.
======================================================================
    `);
    global.dbConnected = false;
  }
};

module.exports = connectDB;

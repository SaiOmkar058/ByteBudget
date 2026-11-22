const mongoose = require('mongoose');

const connectDB = async (retries = 5) => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MongoDB Connection Error: MONGO_URI environment variable is not defined.');
    process.exit(1);
  }

  for (let i = 0; i < retries; i++) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${i + 1}/${retries} failed: ${error.message}`);
      if (i < retries - 1) {
        const delay = Math.min(3000 * (i + 1), 15000);
        console.log(`Retrying in ${delay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error('❌ All MongoDB connection attempts failed. Exiting process.');
  process.exit(1);
};

module.exports = connectDB;

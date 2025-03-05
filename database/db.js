const mongoose = require('mongoose');
require("dotenv").config()

const connectDB = async () => { 
  try {
    if (!process.env.DATABASE_URL) {
      console.log("provide db url")
      return;
    }
    await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection failed")
    process.exit(1)
  }
}
module.exports = connectDB
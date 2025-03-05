const mongoose = require('mongoose');
require("dotenv").config()

const connectDB = async () => { 
  try {
    process.env.DATABASE_URL && await mongoose.connect(process.env.DATABASE_URL);
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection failed")
    process.exit(1)
  }
}
module.exports = connectDB
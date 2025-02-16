const mongoose = require('mongoose');

const connectDB = async () => { 
  try {
    await mongoose.connect(process.env.DATABASE_URL)
    console.log("Database connected successfully")
  } catch (error) {
    console.error("Database connection failed")
    process.exit(1)
  }
}
module.exports = connectDB
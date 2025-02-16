const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], //The enum option in the role field of your Mongoose schema defines the specific roles that users are allowed to have. By setting enum: ['user', 'admin'], you are restricting the role field to only accept the values 'user' or 'admin'.
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports =mongoose.model("User", UserSchema); //The model() method creates a new Mongoose model from the UserSchema and exports it. This model is then imported into the server.js file and used to interact with the database.
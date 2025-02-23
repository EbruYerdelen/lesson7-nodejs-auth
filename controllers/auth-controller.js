//before even writing the controllers for upcoming routes we will write,we need to think of how many routes we will have and what will be the purpose of each route in the app

//first I need a register controller to register a user
//second I need a login controller to login a user
const User = require("../models/User");
const bcrypt= require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");


const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body; //First extract info out of the post req client will make on frontend.The names that the client sends in the request body should match the name attributes of the input fields in the HTML form or the keys used in the JavaScript object when making the request. This ensures that the data is correctly extracted from the request body on the server side.
    //then check if the user already exists in the database
    //When you use the $or operator inside the findOne method, you are telling the findOne method to look for a document that matches at least one of the conditions specified in the $or array and return the first one matching

    const checkExistingUser = await User.findOne({
      $or: [{ username: username }, { email: email }],
    }); //The findOne() method is used to find a single document in the database that matches the specified query criteria. In this case, you are checking if a user with the same username or email already exists in the database. The $or operator is used to specify a compound query that matches documents based on multiple conditions.
    if (checkExistingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists, please try another username or email.",
      });
    }

    //hash the user password and store it it database
    const salt = await bcrypt.genSalt(10); //The genSalt() method generates a salt for hashing the password. The salt is used to add randomness to the hash, making it more secure. The higher the number of rounds, the more secure the hash will be, but it will also take longer to generate the hash.
    const hashedPassword = await bcrypt.hash(password, salt); //The hash() method hashes the password using the generated salt. The hashed password is then stored in the database, ensuring that the original password is not stored in plain text.

    //create a new user object and save it to the database

    const newUser = await User.create({
      username: username,
      email: email,
      password: hashedPassword,
      role: role || "user",
    });

    if (newUser) {
      res.status(201).json({
        success: true,
        message: "User registered successfully.",
        user: newUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "User register failed, please try again.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ succes:false, message: "Something went wrong,please try again." });
  }
} //This controller will handle the registration of a new user. It will receive the user's username, email, and password in the request body, validate the data, hash the password, and save the user to the database. If the user is successfully saved, the controller will return a success message and a token. If there is an error, the controller will return an error message.









const loginUser = async (req, res) => { 
  try {
    const { username, password } = req.body;

    //first check if the user exists in the database,because we can't login a user who doesn't exist.

    const UserMatchingToPassedData = await User.findOne({ username: username });
    if(!UserMatchingToPassedData){
      return res.status(400).json({ success: false, message: "User does not exist.Please register" });
    }

    //if user exists,compare the password with the hashed password in the database.Check if they are matching.

    const isPasswordMatching = await bcrypt.compare(password, UserMatchingToPassedData.password);//first is the password that user enters on frontend and the second is the password we got from findOne,which is the hashed password in the database.
    if (!isPasswordMatching) {
      return res.status(400).json({ success: false, message: "Invalid password." });
    }

    //now based on these credential entered by user,we will generate a token for the user to authenticate and authorize the user.
    //we're going to use bearer token to authenticate and authorize the user.
    //create user token
    const secretKey = process.env.JWT_SECRET_KEY;
    const options = {expiresIn: "15m"};
    const accesToken = jwt.sign({
      userId: UserMatchingToPassedData._id,
      role: UserMatchingToPassedData.role,
      username: UserMatchingToPassedData.username,

    }, secretKey, options);
    //these {userId,role,username} are the payload that we're going to store in the token.when you decode it in auth-middleware.js,you will get these values.

    if (accesToken) {
      res.status(200).json({
        success: true,
        message: "User logged in successfully.",
        token: accesToken,
      })
    }else{
      res.status(400).json({
        success: false,
        message: "User login failed, please try again.",
      });
    }





  } catch (error) {
    console.error(error);
    res.status(500).json({ succes: false, message: "Something went wrong,please try again." });
  }
} //This controller will handle the login of a user. It will receive the user's email and password in the request body, validate the data, compare the password with the hashed password in the database, and generate a token if the password is correct. If the password is incorrect, the controller will return an error message.



const changePassword = async (req, res) => {
  try {
    //first get the currentUserId from the decoded token in auth-middleware.js after the authentication was complete for that user.
    const currentUserId = req.user.userId;
    //extract the old and new password from the request body because you entered your old pass and new pass values on frontend and you're sending those values within the req.body
    const { oldPassword, newPassword } = req.body;

    //now get the current user document(object) based on the currentUserId you got above(it was decoded from the token in auth-middleware).Because we need to know which user is trying to change the password.
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      return res
        .status(400)
        .json({ success: false, message: "User not found." });
    }

    //check if the old password you got from client(which is the old password user enters when attemptin to change the password) matches the password in the database(which is the hashed password in the database)
    const isOldPasswordEnteredTrue = await bcrypt.compare(
      oldPassword,
      currentUser.password
    );
    if (!isOldPasswordEnteredTrue) {
      return res.status(400).json({
        success: false,
        message: "Invalid old password.Please enter your current password.",
      });
    }

    //now hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);
    //update the user's password in the database with the new hashed password
    const updatedUser = await User.findByIdAndUpdate(
      currentUserId,
      { password: hashedNewPassword },
      { new: true }
    );
    //{ new: true } is an options object. The new: true option ensures that the method returns the updated document rather than the original document.
    //The specified document in the User collection is updated with the new hashed password. The old document is replaced with the updated document in the database.
    //The method returns the updated document if the new: true option is specified. If new: true is not specified, it returns the original document before the update.
    if (updatedUser) {
      res.status(200).json({
        success: true,
        message: "Password updated successfully.",
        data: updatedUser,
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Password update failed, please try again."
      });
    }


    /*
      you could also do
      currentUser.password = hashedNewPassword;
      await currentUser.save();
      and move on with the response as
      res.status(200).json({
        success: true,
        message: "Password updated successfully.",
        data: currentUser,
      });
    */

  }catch(error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Something went wrong,please try again." });  
  }
}





module.exports = { registerUser, loginUser,changePassword }; //The controllers are exported so that they can be imported into the routes file and used to handle the incoming requests.













//READ AFTER REGISTERING A USER
/*
after register we will create our login controller to login a user
then we will create our token using JSON Web Token(JWT) to authenticate and authorize the user
then we will learn how we will store that token in our cookie
then we will create a middleware to protect our routes(we wil start implementing protect logic in home-routes.js)

*/


//after creating the controllers for login and register,we have to create a middleware that handles role based authentication to specify which routes are accessible to which users based on their role.
//checking if a user authenticated or not means if checking if the user is logged in or not.
//checking if a user is authorized or not means checking if the user has permission to access a specific resource or perform a specific action.
//after logged in,we will verify the token and check if the user is authorized to access the resource or perform the action.
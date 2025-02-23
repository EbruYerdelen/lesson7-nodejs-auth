const express = require("express");
const router = express.Router();
const { registerUser, loginUser,changePassword } = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/auth-middleware");

//all routes related to authentication&authorization will be handled here


router.post("/register", registerUser); //The /register route is used to register a new user. When a POST request is made to this route, the registerUser controller is called to handle the request.
router.post("/login", loginUser); //The /login route is used to login a user. When a POST request is made to this route, the loginUser controller is called to handle the request.

router.put("/update-pass",authMiddleware,changePassword);//The /update-password route is used to update the password of a user. When a PUT request is made to this route, the changePassword controller is called to handle the request.


module.exports = router; 
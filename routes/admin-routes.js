const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");


/*
when we were protecting home welcome endpoint,we were using only one layer of protection which was to check if user was logged in or not by verifying the acces token
But here we're gonna use two layers of protection: first one will be to check if user is logged in or not again(means checking if authenticated),second layer will check if the logged in user is an admin user or not.if not,server will deny the access.We will handle that
*/
router.get("/welcome",authMiddleware,adminMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Welcome to the admin page.",
    })
});

module.exports = router;
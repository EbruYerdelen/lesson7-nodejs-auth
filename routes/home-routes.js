const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth-middleware");


//we will protect this route with a middleware,so only authenticated users can access it
//logic here is,this router.get can receive multiple handlers as arguments,so we can pass multiple handlers to this route.
//we will pass a middleware to check if the user is authenticated and authorized to access this route.
//let's say that middleware is handler1,and lets say we got handler2,3..and lastly the response giving handler
//if handler1 is succesful,then handler2 will be executed,then handler3..and so on.
//so that if that auth check middleware(handler1) fails,then the response giving handler will not be executed.
router.get("/welcome", authMiddleware, (req, res) => {
  const {username,role,userId}=req.user;//now after token is verified and you have given access to the user,then you can access the user's information from the req object because we decoded the user's info in the authMiddleware.
  res.json({
    success: true,
    message: "Welcome to the home page.",
    user: {
      username: username,
      userId: userId,
      role: role,
    }
  })
});

module.exports = router;


/*
how this protection works:


Client Request: When a client makes a request to the /welcome route, it includes a bearer token in the Authorization header.
Middleware Execution: The authMiddleware function is executed before the route handler. It checks the Authorization header for a valid JWT.
Token Verification: If the token is valid, the middleware allows the request to proceed to the route handler. If the token is invalid or missing, the middleware responds with an error, and the request does not proceed to the route handler.




more in detail!!

what we did in login controller:
User Logs In: When a user logs in, the loginUser controller generates a JWT token for the user.
Token Creation: The token is created using jwt.sign with the user's information (e.g., userId, role, username) and a secret key.
Token Sent to Client: The generated token is sent back to the client in the response.


Once the client receives the token, it needs to store it securely. Common places to store the token include:
Local Storage: localStorage.setItem('token', accesToken);
Session Storage: sessionStorage.setItem('token', accesToken);
Cookies: document.cookie = "token=" + accesToken;


When the client makes subsequent requests to protected routes, it includes the token in the Authorization header of the request.
Here is an example of how the client might send the token in the Authorization header using the fetch API:
async function fetchWelcomeMessage() {
  const token = localStorage.getItem('token'); // Retrieve the token from local storage

  const response = await fetch('http://localhost:3000/api/home/welcome', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',//This header indicates that the request body is formatted as JSON.
      'Authorization': `Bearer ${token}` // Include the token in the Authorization header
    }
  });

  const data = await response.json();
  //The response.json() method is used to parse the JSON-formatted response from the server into a JavaScript object. This method returns a promise that resolves with the result of parsing the response body text as JSON.
  console.log(data);
}
fetchWelcomeMessage();



The authMiddleware function on the server side verifies the token included in the Authorization header. If the token is valid, it attaches the decoded user information to the req object and allows the request to proceed to the route handler:


const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];//When you use the split method with a space (" ") as the delimiter, it tells JavaScript to split the string at each space character. This creates an array of substrings, where each element is a part of the original string that was separated by spaces.

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded; // Attach the decoded token payload to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ success: false, message: "Invalid token." });
  }
};

module.exports = authMiddleware;
*/
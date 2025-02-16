//this will be a simple function that will check if the user is authenticated or not and based on that it will allow or deny the user to access the home page.
const jwt = require("jsonwebtoken");


const authMiddleware = (req, res, next) => {
  const { authorization } = req.headers; //Accessing Headers: When accessing headers in Express, use lowercase for the header names (e.g., authorization).
  console.log(authorization);
  /*
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Unauthorized access." });
  }
  */
  //or you can control as below in case to check authorization token is not provided:
  const userToken = authorization && authorization.split(" ")[1];

  if (!userToken) {
    return res
      .status(401)
      .json({
        success: false,
        message: "Acces Denied.No Token Provided.Please Login To Continue",
      });
  }

  //now decode the token and verify it

  try {
    decodedToken = jwt.verify(userToken, process.env.JWT_SECRET_KEY);
    console.log(decodedToken);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        success: false,
        message: "Something went wrong,please try again.",
      });
  }
}

module.exports = authMiddleware;
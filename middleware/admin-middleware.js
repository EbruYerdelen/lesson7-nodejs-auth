
const isAdminUser = (req, res, next) => {
  const { role } = req.user;
  //The HTTP status code 403 Forbidden indicates that the server understands the request but refuses to authorize it. This status is typically used when the user does not have the necessary permissions to access the requested resource.
  if (role !== "admin") {
    return res.status(403).json({
      succes: false,
      message: "Acces denied.Only admin users have permission to access this resource."
    })
  } 
  //you dont need else part cause in other cases meaning user is admin,the admin route's callback will be executed after we call next()
  next();
}

module.exports = isAdminUser;
const express = require("express");
const router = express.Router();
const { imageUpload, fetchImages, deleteImage } = require("../controllers/image-controller");
const authMiddleware = require("../middleware/auth-middleware");
const adminMiddleware = require("../middleware/admin-middleware");
const  uploadMiddleware  = require("../middleware/upload-middleware");


//first define the route that will handle the image upload.Only authenticated and admin users will be able to upload images.
router.post("/upload", authMiddleware, adminMiddleware, uploadMiddleware.single("image"), imageUpload);
//here we're using multiple middlewares to protect the route,first authMiddleware will check if the user is authenticated or not,then adminMiddleware will check if the user is an admin user or not,then uploadMiddleware will handle the file upload and then imageUpload controller will handle the image upload.

//then we will get the list of all images that are uploaded.Here user roles will not matter,anyone authenticated can access this route.
router.get("/get", authMiddleware, fetchImages);


// Define the route to delete an image
router.delete("/delete/:imageId", authMiddleware, adminMiddleware, deleteImage);


module.exports = router;






/*
READ:
uploadMiddleware.single("image"): This line tells Multer to handle a single file upload with the field name "image".
req.file: After the file is uploaded, Multer processes it and attaches the file information to the req.file property.
When a file is uploaded, req.file will contain information about the file, such as:
{
  "fieldname": "image",
  "originalname": "example.jpg",
  "encoding": "7bit",
  "mimetype": "image/jpeg",
  "destination": "uploads/",
  "filename": "image-1616161616161.jpg",
  "path": "uploads/image-1616161616161.jpg",
  "size": 12345
}
*/
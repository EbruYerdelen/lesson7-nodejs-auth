const multer = require("multer");
const path = require("path");

//now we need to configure multer to create storage and store the uploaded files in a specific folder in your local machine.
//we will use the diskStorage method of multer to configure the storage.
const storage = multer.diskStorage({
  //we first set the destination where the uploaded files will be stored.
  //req is the request object, file is the file object, and cb is the callback function that you call once you are done configuring the storage.
  destination: function (req, file, cb) {
    cb(null, "uploads/");//tells that you want to upload all the images to the uploads folder
  },
  filename: function (req, file, cb) {
    //we set the filename of the uploaded file using the original name of the file and the current timestamp to make it unique.
    //path.extname() method returns the extension of the file.
    cb(null, file.fieldname + "-" + Date.now() + path.extname(file.originalname));
  },

})

//so since you have done creating the storage,you can write a filter function to filter out the files that you want to upload.
//this filter function will check if the file is an image or not.

const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {//checks if the file is an image
    cb(null, true);//if it is an image,pass the file to the next middleware
  } else {
    cb(new Error("Please upload an image file."));//if it is not an image,return an error
  }
}

//now we can create multer middleware using the storage and file filter functions.

module.exports = multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 //5MB file size limit
  }
})



/*
File Upload Request: The client sends a file upload request to the server.
Multer Middleware: The request is processed by the Multer middleware, which handles the file upload. It stores the file locally in the uploads folder and applies any filters and size limits.
File Processing: Once the file is stored locally, it can be processed or validated as needed.
Upload to Cloudinary: The file is then uploaded to Cloudinary using the Cloudinary API.
Database Storage: The URL or other metadata of the uploaded file is stored in the database for future reference.
Response to Client: The server sends a response back to the client, indicating the success or failure of the upload process.



EXAMPLE:
CLIENT SIDE:

<form id="uploadForm">
    <input type="file" id="fileInput" name="image" accept="image/*">
    <button type="submit">Upload</button>
  </form>


  document.getElementById('uploadForm').addEventListener('submit', function(event) {
      event.preventDefault();
      const fileInput = document.getElementById('fileInput');
      const formData = new FormData();
      formData.append('image', fileInput.files[0]);

      axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => {
        console.log('File uploaded successfully:', response.data);
      })
      .catch(error => {
        console.error('Error uploading file:', error);
      });
    });






SERVER SIDE:
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure Multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Store files in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Unique filename
  }
});

// File filter to allow only images
const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Please upload an image file.')); // Reject the file
  }
};

// Create Multer middleware
const upload = multer({
  storage: storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB file size limit
  }
});

// Route to handle file upload
router.post('/upload', upload.single('image'), (req, res) => {
  // File is now available in req.file
  console.log(req.file); // Log the file information
  res.status(200).send({ message: 'File uploaded successfully', file: req.file });
});

module.exports = router;
*/
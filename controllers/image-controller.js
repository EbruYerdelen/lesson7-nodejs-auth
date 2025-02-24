const Image = require("../models/Image")
const { uploadToCloudinary, deleteFromCloudinary } = require("../helpers/cloudinaryHelper")
const fs = require("fs")

const imageUpload = async (req, res) => {
  try {
    //check if the file is missing.
    //The req.file property is populated by middleware that handles file uploads, such as multer. This property contains information about the uploaded file.
    //To handle file uploads, you typically use middleware like multer in your Express application. This middleware processes the incoming file data and attaches it to the req object.
    //If req.file is undefined or null, it means no file was uploaded, and the server responds with a 400 Bad Request status and an error message.
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Please choose a file." });
    }

    //if the file is not missing we will upload it to cloudinary
    //uploadToCloudinary is a helper function that uploads the file to the Cloudinary cloud storage service. This function returns an object with the URL and public ID of the uploaded image.
    const { url, publicId } = await uploadToCloudinary(req.file.path)
    
    //after uploading the file to cloudinary,we will store image url and publicId in the database.(here,mongodb)
    const newImage = await Image.create({
      url: url,
      publicId: publicId,
      uploadedBy: req.user.userId//since the uploadedBy prop of the image schema is in type of ObjectId,we have to pass the user's id(which is in the type of objectId in database) here.
      //when user is logged again,we get the decoded user information from the token in auth-middleware.js and attach it to the req object as user prop.So when a logged in user uploads an image,we can get the user's id from the req object.
    });
    if (newImage) {
      res.status(201).json({
        succes: true,
        message: "Image uploaded successfully.",
        image: newImage
      })
    } else {
      res.status(400).json({
        success: false,
        message: "Image upload failed,please try again."
      })
    }


    //after image is saved to database,we can delete it from our local machine(uploads folder)
    console.log(req.file.path)
    fs.unlinkSync(req.file.path);//this method deletes the file from the local machine.
    //Relative Path: req.file.path provides the relative path from the server's root directory, which is sufficient for most file operations within the server.
    //Full Path: If you need the full absolute path, you can construct it using Node.js's path module.
    //const fullPath = path.resolve(req.file.path);


  } catch (error) {
    console.error("Error uploading image", error)
    res.status(500).json({ success: false, message: "Something went wrong,please try again." });
  }
}



const fetchImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page from the query parameters, default to 1.Client will send this current page parameter in the request he makes.
    const limit = parseInt(req.query.limit) || 5; // Get the number of items per page from the query parameters, default to 10.Client will send this limit parameter in the request he makes.
    const skip = (page - 1) * limit; // Calculate the number of items to skip.If you have 5 items per page and you are on 3rd page,then you have to skip 10 items(2*5=10) to get to the 3rd page.

    const sortBy = req.query.sortBy || "createdAt"; // Get the field to sort by from the query parameters, default to createdAt.This can be useful for displaying images in a particular sequence, such as by creation date, name, or any other field.
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;//means default is descending

    const totalNumberOfImages = await Image.countDocuments();
    const totalPages = Math.ceil(totalNumberOfImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;
    //The name field, or any other field you want to sort by, should be part of the image documents stored in your MongoDB collection. This means that when you upload an image and save its details to the database, you should include the name field (or any other relevant fields) in the document schema.
    //lets say the client requests the results to be sorted by the name field.Here sortObj[sortBy] = sortOrder; our sortObj will be {name:1} or {name:-1} depending on the sortOrder.
    //The sort method in Mongoose allows you to specify the field to sort by and the sort order (ascending or descending). The field to sort by is specified as a key in an object, and the sort order is specified as the value (1 for ascending, -1 for descending).

    const imagesList = await Image.find()
      .populate("uploadedBy", "username email")
      .sort(sortObj)
      .skip(skip)
      .limit(limit);
    //Yes, the .sort(sortObj) method in Mongoose will sort the documents based on the key specified in sortObj and in the order specified by the value associated with that key.

    //The populate method is used to replace the uploadedBy field in each image document with the corresponding user document from the User collection. The second argument, "username email", specifies that only the username and email fields of the user document should be included in the populated data
    //When you call populate("uploadedBy", "username email"), Mongoose replaces the uploadedBy field in each Image document with the corresponding User document, including only the username and email fields.
    //When you use the populate method in Mongoose, it replaces the specified field (in this case, uploadedBy) with the corresponding document from the referenced collection (in this case, the User collection). The _id field is always included by default when you populate a field, even if you specify other fields to include.
    if (imagesList) {
      res.status(200).json({
        success: true,
        images: imagesList,
        totalPages: totalPages,
        currentPage: page,
        totalImages: totalNumberOfImages
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No images found.",
      });
    }
  } catch (error) {
    console.error("Error fetching images", error)
    res.status(500).json({ success: false, message: "Something went wrong,please try again." });
  }
}




const deleteImage = async (req, res) => {
try {
  const { imageId } = req.params; //imageId is the _id that is generated by mongoose when uploading a document to the database.
  const userId = req.user.userId; //userId is the _id of the user who is currently logged in.

  const imageOfTheRelatedId = await Image.findById(imageId);
  if (!imageOfTheRelatedId) {
    return res
      .status(404)
      .json({ success: false, message: "Image not found." });
  }

  //If userId is also of type ObjectId, you should ensure that both userId and imageOfTheRelatedId.uploadedBy are compared as ObjectId instances. Mongoose provides a method called equals that can be used to compare two ObjectId instances directly.
  if (!imageOfTheRelatedId.uploadedBy.equals(userId)) {
    return res
      .status(403)
      .json({
        success: false,
        message: "You are not authorized to delete this image.",
      });
  }

  await deleteFromCloudinary(imageOfTheRelatedId.publicId);
  await Image.findByIdAndDelete(imageId); //findByIdAndDelete is a mongoose method that finds a document by its _id and deletes it from the collection.if you pass the publicId,method will not work.
  res
    .status(200)
    .json({ success: true, message: "Image deleted successfully." });
} catch (error) {
  console.error("Error deleting image", error)
  res.status(500).json({ success: false, message: "Something went wrong,please try again." });
}
}


module.exports = { imageUpload, fetchImages,deleteImage };


/*
in a real life scenerio we can actually map over the list of images we get from the server,passing the _id (coming from mongodb collection) to the onClick attributes of the related buttons.
So that when a user clicks on the delete button of a specific image,we can send a delete request to the server with the image id as a parameter.
example of frontend:

import React, { useEffect, useState } from 'react';

const ImageList = () => {
  const [images, setImages] = useState([]);

  // Fetch images from the server when the component mounts
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/image/get', {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming the token is stored in localStorage
          }
        });
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
        } else {
          console.error('Error fetching images:', data.message);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  // Handle delete image
  const deleteImage = async (imageId) => {
    try {
      const response = await fetch(`/api/image/delete/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming the token is stored in localStorage
        }
      });

      const data = await response.json();
      if (data.success) {
        console.log('Image deleted successfully');
        // Remove the deleted image from the state
        setImages(images.filter(image => image._id !== imageId));
      } else {
        console.error('Error deleting image:', data.message);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div id="imageList">
      {images.map(image => (
        <div key={image._id} className="image-item" data-id={image._id}>
          <img src={image.url} alt="Image" />
          <button onClick={() => deleteImage(image._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default ImageList;
*/



/*
Sorting pagination and filtering: explanation for frontend logic 
Definition: Query parameters are a set of key-value pairs that are appended to the end of a URL. They are used to send additional information to the server.
Syntax: They are appended to the URL after a ? and are separated by &.
Example: /api/image/get?page=1&limit=10
page=1 and limit=10 are query parameters.
Usage: Used for filtering, sorting, pagination, etc.

but 
Request Parameters:
Definition: Request parameters (also known as path parameters) are part of the URL path and are used to identify specific resources.
Syntax: They are part of the URL path and are usually defined in the route.
Example: /api/image/delete/:id
:id is a request parameter.
Usage: Used to identify specific resources, such as a specific image or user.

example frontend&backend usage:
import React, { useEffect, useState } from 'react';

const ImageList = () => {
  const [images, setImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10; // Number of items per page

  // Fetch images from the server when the component mounts or when the currentPage changes
  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/api/image/get?page=${currentPage}&limit=${itemsPerPage}`, {
          headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token') // Assuming the token is stored in localStorage
          }
        });
        const data = await response.json();
        if (data.success) {
          setImages(data.images);
          setTotalPages(data.totalPages);
        } else {
          console.error('Error fetching images:', data.message);
        }
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [currentPage]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div id="imageList">
      {images.map(image => (
        <div key={image._id} className="image-item" data-id={image._id}>
          <img src={image.url} alt="Image" />
          <button onClick={() => deleteImage(image._id)}>Delete</button>
        </div>
      ))}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, index) => (
          <button key={index} onClick={() => handlePageChange(index + 1)}>
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ImageList;




const fetchImages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Get the current page from the query parameters, default to 1
    const limit = parseInt(req.query.limit) || 10; // Get the number of items per page from the query parameters, default to 10
    const skip = (page - 1) * limit; // Calculate the number of items to skip

    // Fetch the total number of images
    const totalImages = await Image.countDocuments();

    // Fetch the images for the current page
    const imagesList = await Image.find()
      .populate("uploadedBy", "username email")
      .skip(skip)
      .limit(limit);

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalImages / limit);

    if (imagesList.length > 0) {
      res.status(200).json({
        success: true,
        images: imagesList,
        totalPages: totalPages,
        currentPage: page
      });
    } else {
      res.status(400).json({
        success: false,
        message: "No images found.",
      });
    }
  } catch (error) {
    console.error("Error fetching images", error);
    res.status(500).json({ success: false, message: "Something went wrong, please try again." });
  }
};
*/
//first import the cloudinary config in the config folder to use the configuration in the helper file.
//this helper file will have a function that will upload the image to cloudinary and return the image URL.

const cloudinary = require("../config/cloudinary");


const uploadToCloudinary = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath)

    return {
      url: result.secure_url,
      publicId: result.public_id

    }
  } catch (error) {
    console.error("Error uploading image to cloudinary", error)
    throw new Error("Error uploading image to cloudinary")
  }
}


const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary deletion result:", result); // Log the result of the deletion
    return result; // Return the result of the deletion
    //Purpose: Deletes an image from Cloudinary using its publicId.
    //Returns: Nothing explicitly, but it will throw an error if the deletion fails.
  } catch (error) {
    console.error("Error deleting image from cloudinary", error)
    throw new Error("Error deleting image from cloudinary")
  }
}

module.exports = {
  uploadToCloudinary,
  deleteFromCloudinary
}

//whenever we want to upload an image we have to call this helper and it'll upload the image to cloudinary storage and return the image URL.
//then we'll use this url and publicId to store in the database.(they'll be matching the schema of the database)


/*
The result object returned by cloudinary.uploader.upload(filePath) contains detailed information about the uploaded image. This object includes various properties such as the URL of the uploaded image, the public ID, the format, dimensions, and more.
{
  "asset_id": "d5c6e5f7e8b9a1c2d3e4f5g6h7i8j9k0",
  "public_id": "sample_image",
  "version": 1616161616,
  "version_id": "1234567890abcdef1234567890abcdef",
  "signature": "abcdef1234567890abcdef1234567890abcdef1234",
  "width": 800,
  "height": 600,
  "format": "jpg",
  "resource_type": "image",
  "created_at": "2023-02-23T10:00:00Z",
  "tags": [],
  "bytes": 123456,
  "type": "upload",
  "etag": "abcdef1234567890abcdef1234567890",
  "placeholder": false,
  "url": "http://res.cloudinary.com/your-cloud-name/image/upload/v1616161616/sample_image.jpg",
  "secure_url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1616161616/sample_image.jpg",
  "access_mode": "public",
  "original_filename": "file"
}
*/
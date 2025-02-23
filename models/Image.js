const { type } = require('express/lib/response');
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, { timestamps: true });


module.exports=mongoose.model("Image", ImageSchema);











/*
uploadedBy explanation:

mongoose.Schema:
mongoose.Schema is a constructor function provided by Mongoose to define the structure of documents within a collection in MongoDB. It allows you to specify the fields and their types, as well as any validation rules and default values.
Types:
mongoose.Schema.Types is an object that contains various data types that you can use in your schema definitions. These types include String, Number, Date, Buffer, Boolean, Mixed, ObjectId, Array, and Decimal128.
ObjectId:
ObjectId is a special type provided by Mongoose (and MongoDB) to represent unique identifiers for documents. It is commonly used for referencing other documents in different collections, creating relationships between them.
ref:
The ref property is used to create a reference to another model. In this case, it indicates that the uploadedBy field references the User model. This allows you to establish a relationship between the Image and User models.


type: mongoose.Schema.Types.ObjectId:
This specifies that the uploadedBy field will store an ObjectId. This ObjectId will be a unique identifier that references a document in another collection.
ref: "User":
This indicates that the ObjectId stored in the uploadedBy field references a document in the User collection. This creates a relationship between the Image and User models.
*/
/**
 * @swagger
 * tags:
 *   name: Product
 *   description: Product management operations
 */
const express = require("express");
const Product = require("../models/Product");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { ObjectId } = require("mongoose").mongo;
const cloudinary = require("cloudinary").v2;
// import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dkmrmhwum",
  api_key: "946847956626661",
  api_secret: "e84bTJa7c9hpEVgIgRJDrDeI1RM",
});





// Function to upload image to Cloudinary
const uploadToCloudinary = async (file) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { resource_type: "auto" }, // Use 'auto' to automatically determine the resource type (image, video, etc.)
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      )
      .end(file.buffer);
  });
};

// Route to create a new product


// Create MongoDB connection
const conn = mongoose.createConnection(
  "mongodb+srv://alizadishah2:4XQ6riEEsTqENYlp@cluster0.bh9tzbc.mongodb.net/?retryWrites=true&w=majority"
);

let gfs;

conn.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db);
});

const storage = multer.memoryStorage(); // Use memory storage to store the image as a buffer

const upload = multer({ storage: storage });

// Route to create a new product
router.post("/addProduct", upload.single("image"), async (req, res) => {
  try {

    // console.log("endpoint hits");
    const { name, stock, imageType,weight } = req.body;
    const price = Number(req.body.price);

    if (isNaN(price)) {
      return res.status(400).json({ message: "Invalid price value." });
    }

    if (!name || !price || !stock || !imageType || !weight) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }
    let imageUrl; // Variable to store the image URL or base64 string

    if (imageType === "base64") {
      // Access the image buffer from the request and convert to base64
      const imageBuffer = req.file.buffer;

      // Check if the imageBuffer is present
      if (!imageBuffer) {
        console.error("Error: Image buffer is missing in req.file.");
        return res.status(500).json({ message: "Internal Server Error" });
      }

      // Convert the imageBuffer to base64
      const base64String = imageBuffer.toString("base64");

      // Log the base64String content
      console.log("Base64 String:", base64String);

      // Generate the data URL
      imageUrl = `data:${req.file.mimetype};base64,${base64String}`;

      const newProduct = new Product({
        name,
        price,
        stock,
        weight,
        image: imageUrl,
        imageType,
      });

      // Save the new product to the database
      const savedProduct = await newProduct.save();

      // Respond with the saved product data
      res.status(201).json(savedProduct);
    }
    if (imageType === "cloudinary") {
      try {
        const cloudinaryUrl = await uploadToCloudinary(req.file);
        imageUrl = cloudinaryUrl;
      } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      const newProduct = new Product({
        name,
        
        price,
        stock,
        weight,
        imageType,
        image: imageUrl,
      });

      // Save the new product to the database
      const savedProduct = await newProduct.save();

      // Respond with the saved product data
      res.status(201).json(savedProduct);
    }
    if (imageType === "gridfs") {
      // Create a write stream with the filename
      const writeStream = gfs.openUploadStream(req.file.originalname);

      // Pipe the file buffer to the write stream
      writeStream.end(req.file.buffer);

      // Handle finish event
      writeStream.on("finish", async () => {
        // Set the image URL to the route that serves the image from GridFS
        imageUrl = `/api/product/image/${req.file.originalname}`;

        const newProduct = new Product({
          name,
          
          price,
          stock,
          weight,
          image: imageUrl,
          imageType,
        });

        // Save the new product to the database
        const savedProduct = await newProduct.save();

        // Respond with the saved product data
        res.status(201).json(savedProduct);
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
 
router.get("/displayAllProducts", async (req, res) => {
  try {
    console.log("Fetching all products...");
    const DisplayProducts = await Product.find();

    res.status(200).json(DisplayProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});












router.put('/editProduct/:id', upload.single('image'), async (req, res) => {
  try {
    console.log(req.file); // Logging to see what the file object contains
    const { id } = req.params;
    const updatedProductData = req.body;

    // Check if there is an uploaded image
    if (req.file) {
      // Check how the image is stored: as a buffer or a path
      if (req.file.buffer) {
        // Assuming you want to convert the buffer to base64 and save it in the database
        const imageBase64 = req.file.buffer.toString('base64');
        updatedProductData.image = `data:${req.file.mimetype};base64,${imageBase64}`;
      } else if (req.file.path) {
        // If the image is stored on the disk and the path is provided
        updatedProductData.image = req.file.path;
      }
    }

    // Use the findByIdAndUpdate method to update the product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updatedProductData,
      { new: true } // This option returns the document after update was applied
    );

    // Check if the product was found and updated
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Send back the updated product
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});













// Route to delete a product by ID
router.delete('/deleteProduct/:id', async (req, res) => {
  try {
    const { id } = req.params; // Get product ID from URL parameter
    // Find the product by ID and delete it
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    // Return a success message
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Total Products


router.get('/totalProducts', async (req, res) => {
  try {
    // Query the database to get the total count of users
    const totalProducts = await Product.countDocuments();
    res.json({ totalProducts }); 
  } catch (error) {
    console.error('Error fetching total Products:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
















module.exports = router;

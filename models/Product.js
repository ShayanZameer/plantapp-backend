const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: String, required: true },

  imageType: { type: String, enum: ["base64", "cloudinary", "gridfs"] },

  reviews: { type: Array, default: [] },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;

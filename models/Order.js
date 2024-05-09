const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },


  saleAmount: {
    type: Number,
    required: true
  },

  // Payment method used for the order
  paymentMethod: {
    type: String,
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],


  status: {
    type: String,
    enum: ["Pending", "Processing", "Shipped", "Delivered"], // Example status values
    required: true
  },

  
  orderDate: {
    type: Date,
    default: Date.now,
  },

  orderNo: {
    type: String,
    required: true,
  },

  trackingNumber: {
    type: String,
    required: true,
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

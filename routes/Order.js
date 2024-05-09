/**
 * @swagger
 * tags:
 *   name: Order
 *   description: Order management operations
 */

const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const crypto = require("crypto");
const fetchuser = require("../middleware/fetchuser");

const generateRandomTrackingNumber = () => {
  const randomBytes = crypto.randomBytes(6); // Adjust the number of bytes as needed
  const trackingNumber = randomBytes.toString("hex").toUpperCase();
  return trackingNumber;
};

// Create Order

/**
 * @swagger
 * /api/order/createOrder:
 *   post:
 *     summary: Create a new order
 *     tags: [Order]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 description: Array of products in the order
 *               orderNo:
 *                 type: string
 *                 description: Order number
 *     responses:
 *       201:
 *         description: Order successfully created
 *         content:
 *           application/json:
 *             example:
 *               _id: "orderID"
 *               userId: "userID"
 *               products: [{ productId: "productID", quantity: 2, price: 10 }]
 *               orderNo: "orderNumber"
 *               trackingNumber: "trackingNumber"
 *               orderDate: "orderDate"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
// router.post("/createOrder", fetchuser, async (req, res) => {
//   try {
//     console.log("Received Request Body:", req.body);

//     const { products, orderNo } = req.body;
//     const userId = req.user.id;

//     const trackingNumber = generateRandomTrackingNumber();
//     console.log(trackingNumber);
//     const date = Date.now();
//     const orderDate = new Date(date).toLocaleString();
//     // Create a new order
//     const newOrder = new Order({
//       userId,
//       products,
//       orderNo,
//       trackingNumber,
//       orderDate,
//     });

//     // Save the order to the database
//     const savedOrder = await newOrder.save();

//     res.status(201).json(savedOrder);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });




router.post("/createOrder", fetchuser, async (req, res) => {
  try {
    console.log("Received Request Body:", req.body);

    const { paymentMethod, products, status, orderNo } = req.body;

    const userId = req.user.id;

    // Calculate saleAmount based on products and their quantities
    let saleAmount = 0;
    products.forEach(product => {
      saleAmount += product.price * product.quantity;
    });

    // Generate a random tracking number
    const trackingNumber = generateRandomTrackingNumber();
    console.log(trackingNumber);

    // Get the current date and format it
    const orderDate = new Date().toLocaleString();

    // Create a new order
    const newOrder = new Order({
      userId,
      saleAmount,
      paymentMethod,
      products,
      status,
      orderNo,
      trackingNumber,
      orderDate
    });

    // Save the order to the database
    const savedOrder = await newOrder.save();

    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


/**
 * @swagger
 * /api/order/myOrders:
 *   get:
 *     summary: Retrieve user's orders
 *     tags: [Order]
 *     responses:
 *       200:
 *         description: Successfully retrieved user's orders
 *         content:
 *           application/json:
 *             example:
 *               - _id: "orderID"
 *                 userId: "userID"
 *                 products: [{ productId: "productID", quantity: 2, price: 10 }]
 *                 orderNo: "orderNumber"
 *                 trackingNumber: "trackingNumber"
 *                 orderDate: "orderDate"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.get("/myOrders", async (req, res) => {
  try {
    // const userId = req.user.id;

    const userOrders = await Order.find();

    res.status(200).json(userOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/order/orderDetails/{orderId}:
 *   get:
 *     summary: Retrieve details of a specific order
 *     tags: [Order]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the order to retrieve details
 *     responses:
 *       200:
 *         description: Successfully retrieved order details
 *         content:
 *           application/json:
 *             example:
 *               orderId: "orderID"
 *               orderNo: "orderNumber"
 *               orderDate: "orderDate"
 *               trackingNumber: "trackingNumber"
 *               products: [{ productId: "productID", quantity: 2, price: 10 }]
 *               totalProductsPrice: 20
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Order not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

router.get("/orderDetails/:orderId", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.orderId;

    // Fetch the specific order based on user ID and orderId
    const userOrder = await Order.findOne({ userId, _id: orderId });

    if (!userOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Calculate total price for the order
    const totalProductsPrice = userOrder.products.reduce(
      (total, product) => total + product.quantity * product.price,
      0
    );

    // Format the data
    const orderDetails = {
      orderId: userOrder._id,
      orderNo: userOrder.orderNo,
      orderDate: userOrder.orderDate,
      trackingNumber: userOrder.trackingNumber,
      products: userOrder.products,
      totalProductsPrice,
    };

    res.status(200).json(orderDetails);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// counting total orders

router.get('/totalOrders', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders }); 
  } catch (error) {
    console.error('Error fetching total Orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// First Four Orders


router.get('/firstFourOrders', async (req, res) => {
  try {
    // Query the database to get the first 4 orders
    const firstFourOrders = await Order.find().limit(4);
    res.json(firstFourOrders); // Send the first 4 orders as JSON response
  } catch (error) {
    console.error('Error fetching first four orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});
module.exports = router;

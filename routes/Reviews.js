/**
 * @swagger
 * tags:
 *   name: Reviews
 *   description: Reviews of Propduct operations
 */

const express = require("express");
const router = express.Router();

const Product = require("../models/Product");
const fetchuser = require("../middleware/fetchuser");

// Add a review to a product

/**
 * @swagger
 * /addReview/{productId}:
 *   post:
 *     summary: Add a review to a product
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Review added successfully
 *       400:
 *         description: Bad request, please provide both rating and comment
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.post("/addReview/:productId", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const productId = req.params.productId;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res
        .status(400)
        .json({ message: "Please provide both rating and comment." });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Add the review to the product
    product.reviews.push({
      userId,
      rating,
      comment,
    });

    const updatedProduct = await product.save();

    res.status(201).json(updatedProduct.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reviews for a specific product

/**
 * @swagger
 * /getReviews/{productId}:
 *   get:
 *     summary: Get reviews for a specific product
 *     tags:
 *       - Product
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal Server Error
 */
router.get("/getReviews/:productId", async (req, res) => {
  try {
    const productId = req.params.productId;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product.reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: User cart operations
 */

const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Product = require("../models/Product");

const fetchuser = require("../middleware/fetchuser");

// Add a product to the user's cart

/**
 * @swagger
 * /api/cart/add/{productId}:
 *   post:
 *     summary: Add a product to the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to be added to the cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: "The quantity of the product to be added (default: 1)"
 *     responses:
 *       200:
 *         description: Product successfully added to the cart
 *         content:
 *           application/json:
 *             example:
 *               - productId: "productID"
 *                 quantity: 2
 *       404:
 *         description: User or product not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found or Product not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

router.post("/add/:productId", fetchuser, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Check if the product is already in the cart
    const existingCartItem = user.cart.find(
      (item) => item.productId.toString() === productId
    );

    if (existingCartItem) {
      // Update quantity if the product is already in the cart
      existingCartItem.quantity += quantity || 1;
    } else {
      // Add the product to the cart
      user.cart.push({ productId, quantity });
    }

    await user.save();

    res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// View the user's cart

/**
 * @swagger
 * /api/cart/displayCart:
 *   get:
 *     summary: View the user's cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         description: Successfully retrieved the user's cart
 *         content:
 *           application/json:
 *             example:
 *               - productId: "productID"
 *                 quantity: 2
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.get("/displayCart", fetchuser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate(
      "cart.productId",
      "name price"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update the quantity of a product in the user's cart

/**
 * @swagger
 * /api/cart/updateQuantity/{productId}:
 *   put:
 *     summary: Update the quantity of a product in the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product in the cart to be updated
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: number
 *                 description: The new quantity of the product
 *     responses:
 *       200:
 *         description: Quantity of the product in the cart successfully updated
 *         content:
 *           application/json:
 *             example:
 *               - productId: "productID"
 *                 quantity: 5
 *       404:
 *         description: User not found or product not in the cart
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found or Product not found in the cart"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

// Remove a product from the user's cart

/**
 * @swagger
 * /api/cart/removeProduct/{productId}:
 *   delete:
 *     summary: Remove a product from the user's cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the product to be removed from the cart
 *     responses:
 *       200:
 *         description: Product successfully removed from the cart
 *         content:
 *           application/json:
 *             example:
 *               - productId: "productID"
 *                 quantity: 2
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.delete("/removeProduct/:productId", fetchuser, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.cart = user.cart.filter(
      (item) => item.productId.toString() !== productId
    );

    await user.save();

    res.status(200).json(user.cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;

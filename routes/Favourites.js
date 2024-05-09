/**
 * @swagger
 * tags:
 *   name: Favorites
 *   description: Operations related to user favorites
 */

const express = require("express");

const Product = require("../models/Product");

const router = express.Router();
const User = require("../models/User");
const mongoose = require("mongoose");

const fetchuser = require("../middleware/fetchuser");

/**
 * @swagger
 * /api/favorites/addToFavorites/{productId}:
 *   post:
 *     summary: Add a product to user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to add to favorites
 *     responses:
 *       '201':
 *         description: Product successfully added to favorites
 *         content:
 *           application/json:
 *             example:
 *               - userId1
 *               - userId2
 *       '400':
 *         description: Product is already in favorites or invalid product ID
 *         content:
 *           application/json:
 *             example:
 *               message: "Product is already in favorites"
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Product not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

router.post("/addToFavorites/:productId", fetchuser, async (req, res) => {
  try {
    console.log("User information:", req.user);
    const userId = req.user.id;
    const productId = req.params.productId;

    // Ensure that userId is valid
    if (!userId) {
      return res.status(500).json({ message: "User information is missing" });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    // Ensure that user is found and has the favorites array
    if (!user || !user.favorites) {
      console.log("HELLO WORLD");
      console.log("User information:", user);
      console.log(user.favorites);
      return res.status(500).json({ message: "User information is missing" });
    }

    // Check if the product is already in favorites
    const isProductInFavorites = user.favorites.some(
      (fav) => fav.toString() === productId
    );

    if (isProductInFavorites) {
      return res
        .status(400)
        .json({ message: "Product is already in favorites" });
    }

    // Add the product to user's favorites
    user.favorites.push(productId);

    // Save the updated user document
    await user.save();

    res.status(201).json({
      message: "Product added to favorites",
      favorites: user.favorites,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/favorites/getFavorites:
 *   get:
 *     summary: Get user's favorite products
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully retrieved user's favorite products
 *         content:
 *           application/json:
 *             example:
 *               - _id: "productID"
 *                 image: "productImageURL"
 *                 name: "productName"
 *                 productType: "productCategory"
 *                 price: 10.99
 *                 description: "Product description"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

router.get("/getFavorites", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Find the user with the specified ID and populate the 'favorites' array
    const user = await User.findById(userId).populate("favorites");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favoriteProducts = user.favorites.map((favorite) => {
      if (favorite && favorite.toString) {
        return favorite.toString(); // Convert ObjectId to string
      } else {
        console.error("Undefined productId in favorites:", favorite);
        return null;
      }
    });

    res.status(200).json(favoriteProducts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Remove a product from favorites

/**
 * @swagger
 * /api/favorites/removeFromFavorites/{productId}:
 *   delete:
 *     summary: Remove a product from user favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product to remove from favorites
 *     responses:
 *       '200':
 *         description: Product successfully removed from favorites
 *         content:
 *           application/json:
 *             example:
 *               - userId1
 *               - userId2
 *       '400':
 *         description: Product is not in favorites or invalid product ID
 *         content:
 *           application/json:
 *             example:
 *               message: "Product is not in favorites"
 *       '404':
 *         description: Product not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Product not found"
 *       '500':
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */
router.delete(
  "/removeFromFavorites/:productId",
  fetchuser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId } = req.params.productId;
      console.log("ProductId:", productId);

      // Find the user by ID
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const favoriteIndex = user.favorites.findIndex((fav) => {
        return fav.productId === productId;
      });

      if (favoriteIndex === -1) {
        return res.status(400).json({ message: "Product is not in favorites" });
      }

      // Remove the product from favorites
      user.favorites.splice(favoriteIndex, 1);

      // Save the updated user
      await user.save();

      res.status(200).json({ message: "Product removed from favorites" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);
// router.delete(
//   "/removeFromFavorites/:productId",
//   fetchuser,
//   async (req, res) => {
//     try {
//       const { productId } = req.params;

//       const user = await User.findById(req.user.id);

//       if (!user) {
//         return res.status(404).json({ message: "User not found" });
//       }

//       // Filter out the item with the specified productId
//       user.favorites = user.favorites.filter((item) => {
//         item.productId !== productId;
//         console.log("ITEM" + item.productId.toString());
//         console.log("PRODUCT" + productId);
//       });

//       console.log(user.favorites);

//       await user.save();

//       res.status(200).json(user.favorites);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: "Internal Server Error" });
//     }
//   }
// );

module.exports = router;

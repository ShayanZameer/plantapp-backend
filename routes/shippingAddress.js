/**
 * @swagger
 * tags:
 *   name: Shipping Address
 *   description: Shipping address management operations
 */

const express = require("express");
const router = express.Router();
const User = require("../models/User");
const fetchuser = require("../middleware/fetchuser");

/**
 * @swagger
 * /api/shippingAddress/addShippingAddress:
 *   post:
 *     summary: Add a new shipping address for the user
 *     tags: [Shipping Address]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name associated with the shipping address
 *               address:
 *                 type: string
 *                 description: Detailed address information
 *               state:
 *                 type: string
 *                 description: State or region of the shipping address
 *               zipCode:
 *                 type: string
 *                 description: ZIP code of the shipping address
 *               country:
 *                 type: string
 *                 description: Country of the shipping address
 *     responses:
 *       200:
 *         description: Shipping address successfully added
 *         content:
 *           application/json:
 *             example:
 *               - name: "John Doe"
 *                 address: "123 Main St"
 *                 state: "California"
 *                 zipCode: "90001"
 *                 country: "USA"
 *       400:
 *         description: Please provide all required fields
 *         content:
 *           application/json:
 *             example:
 *               message: "Please provide all required fields."
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
router.post("/addShippingAddress", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, address, state, zipCode, country } = req.body;

    if (!name || !address || !state || !zipCode || !country) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newShippingAddress = {
      name,
      address,
      state,
      zipCode,
      country,
    };

    user.shippingAddresses.push(newShippingAddress);

    const updatedUser = await user.save();

    res.status(200).json(updatedUser.shippingAddresses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @swagger
 * /api/shippingAddress/editShippingAddress/{addressIndex}:
 *   put:
 *     summary: Edit a user's existing shipping address
 *     tags: [Shipping Address]
 *     parameters:
 *       - in: path
 *         name: addressIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the shipping address to be edited
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name associated with the shipping address
 *               address:
 *                 type: string
 *                 description: Detailed address information
 *               state:
 *                 type: string
 *                 description: State or region of the shipping address
 *               zipCode:
 *                 type: string
 *                 description: ZIP code of the shipping address
 *               country:
 *                 type: string
 *                 description: Country of the shipping address
 *     responses:
 *       200:
 *         description: Shipping address successfully edited
 *         content:
 *           application/json:
 *             example:
 *               - name: "John Doe"
 *                 address: "456 Oak St"
 *                 state: "New York"
 *                 zipCode: "10001"
 *                 country: "USA"
 *       400:
 *         description: Please provide all required fields
 *         content:
 *           application/json:
 *             example:
 *               message: "Please provide all required fields."
 *       404:
 *         description: User not found or Address not found
 *         content:
 *           application/json:
 *             example:
 *               message: "User not found or Address not found"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             example:
 *               message: "Internal Server Error"
 */

router.put(
  "/editShippingAddress/:addressIndex",
  fetchuser,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const addressIndex = req.params.addressIndex;
      const { name, address, state, zipCode, country } = req.body;

      if (!name || !address || !state || !zipCode || !country) {
        return res
          .status(400)
          .json({ message: "Please provide all required fields." });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Find the specific shipping address based on the provided index
      const addressToUpdate = user.shippingAddresses[addressIndex];

      if (!addressToUpdate) {
        return res.status(404).json({ message: "Address not found" });
      }

      // Update the specific shipping address
      addressToUpdate.name = name;
      addressToUpdate.address = address;
      addressToUpdate.state = state;
      addressToUpdate.zipCode = zipCode;
      addressToUpdate.country = country;
      const updatedUser = await user.save();

      res.status(200).json(updatedUser.shippingAddresses);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication and related operations
 */

const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const fetchuser = require("../middleware/fetchuser");

const JWT_SECRET = "Shayanisagoodb$oy";

const emailUser = "alizadishah2@gmail.com";
const emailPassword = "abqw tqlh imfs wuwq";

const nodemailer = require("nodemailer");

const randomstring = require("randomstring");

// Method to send mail

const sendResetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",

      port: 465,
      secure: true,
      requireTLS: true,

      auth: { user: emailUser, pass: emailPassword },
    });
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "for reset password",
      html:
        "<p> Hii " +
        name +
        ", please copy the link and <a href='http://localhost:5000/api/auth/reset-password?token=" +
        token +
        "'>reset your password</a></p> ",
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(
          error + " there is some error in Sending main check please "
        );
      } else {
        console.log("Mail has been set" + info.response);
      }
    });
  } catch (error) {
    res.status(400).send({ succes: false, msg: error.message });
  }
};



router.get('/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /api/auth/signUp:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: Successfully registered a new user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               authToken: "jwtAuthToken"
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               errors: [{msg: "Invalid input"}]
 */

router.post(
  "/signUp",
  [body("name").isLength({ min: 3 })],
  async (req, res) => {
    try {
      let success = false;

      // Validate input data
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() });
      }

      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ success, error: "Sorry, user already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);
      user = new User({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        role:req.body.role
      });

      await user.save();

      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_SECRET);

      success = true;

      res.json({ success, authToken });
    } catch (error) {
      console.error(error);
    }
  }
);

// Endpoint for login or authenticate a user

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login and authenticate a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully authenticated a user
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               authToken: "jwtAuthToken"
 *       400:
 *         description: Invalid credentials or missing input
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               errors: [{msg: "Invalid credentials"}]
 */
router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);

      if (!passwordCompare) {
        success = false;
        return res.status(400).json({ success, error: "Invalid credentials" });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      const authToken = jwt.sign(payload, JWT_SECRET);
      success = true;
      res.json({ success, authToken });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Endpoint for forgot Password

/**
 * @swagger
 * /api/auth/forget-password:
 *   post:
 *     summary: Initiate the forgot password process
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Email sent for password reset
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               msg: "Please Check you email for messeage and reset you password"
 *       201:
 *         description: Email does not exist
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               msg: "This email does not exist"
 *       400:
 *         description: Error during the process
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               msg: "Error message"
 */

router.post("/forget-password", async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });

    if (userData) {
      const rstring = randomstring.generate();

      const data = await User.updateOne(
        { email: email },
        { $set: { token: rstring } }
      );

      sendResetPasswordMail(userData.name, userData.email, rstring);

      res.status(200).send({
        success: true,
        msg: "Please Check you email for messeage and reset you password ",
      });
    } else {
      res.status(200).send({ success: true, msg: "This email doesnot exist" });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: error.message });
  }
});

// Endpoint for Reset Password

/**
 * @swagger
 * /api/auth/reset-password:
 *   get:
 *     summary: Reset user password using a token
 *     tags: [Authentication]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         description: Token received for resetting the password
 *     responses:
 *       200:
 *         description: Password successfully reset
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               msg: "User password has changed"
 *               data:
 *                 userId: "12345"
 *                 username: "john_doe"
 *                 email: "john.doe@example.com"
 *       201:
 *         description: Token has expired
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               msg: "LINK HAS EXPIRED"
 *       400:
 *         description: Error during the process
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               msg: "Error message"
 */

router.get("/Reset-Password", async (req, res) => {
  try {
    const token = req.query.token;

    const userData = await User.findOne({ token: token });

    if (userData) {
      const password = req.body.password;

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);

      const newUser = await User.findByIdAndUpdate(
        { _id: userData._id },
        { $set: { password: secPass, token: "" } },
        { new: true }
      );

      res.status(200).send({
        success: true,
        msg: "User password ha change  ",
        data: newUser,
      });
    } else {
      res.status(200).send({ success: true, msg: "LINK HAS EXPIRE " });
    }
  } catch (error) {
    res.status(400).send({ success: false, msg: "hhhhhh" });
  }
});




// PUT /api/users/:id
router.put('/editUser/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role } = req.body;

    // Find the user by ID and update the fields
    const user = await User.findByIdAndUpdate(id, { email, name, role }, { new: true });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error editing user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// DELETE /api/users/:id
router.delete('/deleteUser/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the user by ID and delete it
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// count the total number of user in database

router.get('/totalUsers', async (req, res) => {
  try {
    // Query the database to get the total count of users
    const totalUsers = await User.countDocuments();
    res.json({ totalUsers }); // Send the total number of users as JSON response
  } catch (error) {
    console.error('Error fetching total users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;

const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Ecommerce backend Api Documentation",
      version: "1.0.0",
    },
    servers: [
      {
        url: "http://localhost:5000/", // Fix the typo in 'url'
        description: "Local development server",
      },
    ],
  },
  apis: [
    "./routes/Product.js",
    "./routes/Cart.js",
    "./routes/auth.js",
    "./routes/shippingAddress.js",
    "./routes/Reviews.js",
    "./routes/Favourites.js",
  ], // Correct the paths to your route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;

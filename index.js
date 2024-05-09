const connectToMongo = require("./db");

var express = require("express");
const compression = require("compression");
var cors = require("cors");

const app = express();
app.use(compression());

// Limit the size of JSON and URL-encoded bodies to 20MB
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ limit: "20mb", extended: true }));

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swaggerConfig");

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
connectToMongo();
const port = 5000;
app.use(cors());

app.use(express.json());

// Routes

app.use("/api/auth", require("./routes/auth"));
app.use("/api/Product", require("./routes/Product"));

app.use("/api/Cart", require("./routes/Cart"));
app.use("/api/Favourites", require("./routes/Favourites"));

app.use("/api/Order", require("./routes/Order"));
app.use("/api/shippingAddress", require("./routes/shippingAddress"));
app.use("/api/Review", require("./routes/Reviews"));

app.get("/", (req, res) => {
  res.send("Backend Api is working Fine ");
});

app.get("/developer", (req, res) => {
  res.send(
    "Shayan Zameer (MERN STACK DEVELOPER) from Comsats University Islamabad "
  );
});

const server = app.listen(port, () => {
  console.log(`Ecommerce backend app listening at http://localhost:${port}`);
});

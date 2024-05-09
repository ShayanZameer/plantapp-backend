var jwt = require("jsonwebtoken");
const JWT_SECRET = "Shayanisagoodb$oy";

const fetchuser = (req, res, next) => {
  // Get User from jwt Token and add id to request object

  const token = req.header("auth-token");

  if (!token) {
    res.status(401).send({ error: "PLEASE AUTHENTICATE A VALID TOKEN" });
  }

  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data.user;

    next();
  } catch (error) {
    res.status(401).send({ error: "PLEASE AUTHENTICATE A VALID TOKEN" });
  }
};
module.exports = fetchuser;



const mongoose = require("mongoose");

// const mongoURI = "mongodb://localhost:27017/ecommerce-backend";

//   "mongodb+srv://<alizadishah2>:<4XQ6riEEsTqENYlp>@cluster0.mongodb.net/ecommercebackend?retryWrites=true&w=majority";
// const mongoURI =
//   "mongodb+srv://alizadishah2:4XQ6riEEsTqENYlp@cluster0.bh9tzbc.mongodb.net/?retryWrites=true&w=majority";

const mongoURI="mongodb+srv://fahadali:fahad034@cluster0.tbmddp7.mongodb.net/vehical?retryWrites=true&w=majority"
const connectToMongo = () => {
  try {
    mongoose.connect(mongoURI, {
      family: 4,
    });

    console.log("connected to mongo db atlas");
  } catch (err) {
    console.log("error in connecting to mongo db atlas");

    console.error(err);
  }
};
module.exports = connectToMongo;

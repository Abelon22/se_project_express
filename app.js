const mongoose = require("mongoose");
const express = require("express");

async function connectToMongoose() {
  await mongoose.connect("mongodb://localhost:27017/wtwr_db");
}

connectToMongoose()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const { PORT = 3000 } = process.env;

const app = express();

express.use(express.json());

express.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

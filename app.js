const mongoose = require("mongoose");
const express = require("express");
const routes = require("./routes");

async function connectToMongoose() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wtwr_db");
}

connectToMongoose()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const { PORT = 3001 } = process.env;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.user = {
    _id: "68d31ec9562400891620dd0f",
  };
  next();
});

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

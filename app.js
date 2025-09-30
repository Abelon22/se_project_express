const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const { MONGO_URI, PORT } = require("./utils/config");

const { createUser, login } = require("./controllers/users");

async function connectToMongoose() {
  await mongoose.connect(MONGO_URI);
}

connectToMongoose()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/signin", login);
app.post("signup", createUser);

app.use(routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

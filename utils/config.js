require("dotenv").config();

const MONGO_URI = "mongodb://127.0.0.1:27017/wtwr_db";

const { PORT = 3001, JWT_SECRET = "overton-secret-code" } = process.env;

module.exports = { JWT_SECRET, MONGO_URI, PORT };

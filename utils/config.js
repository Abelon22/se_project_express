const JWT_SECRET = "overton-secret-code";
const MONGO_URI = "mongodb://127.0.0.1:27017/wtwr_db";

const { PORT = 3001 } = process.env;

module.exports = { JWT_SECRET, MONGO_URI, PORT };

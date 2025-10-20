const mongoose = require("mongoose");
const express = require("express");
const { errors } = require("celebrate");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error-handler");
const { requestLogger, errorLogger } = require("./middlewares/logger");

const { openapiSpec } = require("./docs/openapi");

const { MONGO_URI, PORT } = require("./utils/config");

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

const allowedOrigins = [
  "https://wtwr.lookids.com",
  "https://www.wtwr.lookids.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Origin", "Accept"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { explorer: true })
);
app.use(requestLogger);
app.use(routes);

app.use(errorLogger);

app.use(errors());

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

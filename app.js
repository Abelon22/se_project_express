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
  "https://api.wtwr.lookids.com", // usually not needed as an Origin, but ok to include
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // if you send cookies/authorization
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

# WTWR (What to Wear?) – Backend API

A Node.js/Express API for the WTWR app that helps users decide what to wear based on weather. Features JWT auth, owner-scoped item permissions, robust error handling, and interactive API docs.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Environment Setup](#environment-setup)
- [Run](#run)
- [API Docs (Swagger UI)](#api-docs-swagger-ui)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
  - [Smoke Test (Axios)](#smoke-test-axios)
  - [Jest E2E Tests](#jest-e2e-tests)
- [Auth Flow](#auth-flow)
- [Project Structure](#project-structure)
- [Error Handling](#error-handling)
- [Linting](#linting)
- [Notes / Tips](#notes--tips)

## Features

- **JWT Authentication** with 7-day tokens (login returns token in body)
- **Protected Routes** using `Authorization: Bearer <token>`
- **Users**: get/update current user
- **Clothing Items**: public listing, owner-only delete, like/unlike
- **Centralized Error Handling** with consistent JSON responses
- **Interactive API Docs** (Swagger UI) served from the app
- **Smoke Test** coverage for api with axios. Install if needed.

## Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs
- **Documentation**: Swagger UI / OpenAPI 3.0
- **Testing**: Axios, Jest

## Environment Setup

Create a `.env` file (and optionally `.env.test` for test runs):

```env
MONGO_URI=mongodb://127.0.0.1:27017/wtwr
JWT_SECRET=dev-secret-change-me
PORT=3001
NODE_ENV=development
```

## Run

```bash
# Install dependencies
npm install

# Development (e.g., nodemon if configured)
npm run dev

# Production
npm start
```

Base URL defaults to `http://localhost:3001`.

## API Docs (Swagger UI)

Interactive docs live at `/docs` (when enabled).

### Installation

Install (already in project if you followed the instructions):

```bash
npm i swagger-ui-express swagger-jsdoc
```

### Setup

Mount docs before your API router (or mount your API under a prefix) so the router's 404 does not swallow `/docs`:

```javascript
// app.js
const swaggerUi = require("swagger-ui-express");
const { openapiSpec } = require("./docs/openapi");
const { createError } = require("./utils/errors");
const routes = require("./routes");
const errorHandler = require("./middlewares/errorHandler");

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec, { explorer: true })
);
app.get("/openapi.json", (_req, res) => res.json(openapiSpec));

app.use(routes);

// app-level 404
app.use((req, res, next) =>
  next(createError("not_found", "Requested resource not found"))
);

// error handler last
app.use(errorHandler);
```

### Usage

1. Browse to: `http://localhost:3001/docs`
2. Click **Authorize** → paste your JWT → **"Try it out"**

If you prefer a prefix for the API (e.g., `/api`), use `app.use('/api', routes);` then endpoints are `/api/signup`, `/api/users/me`, etc. `/docs` will still work.

## API Endpoints

### Auth

- `POST /signup` – Register a user (email, password, name, avatar)
- `POST /signin` – Login, returns `{ token }`

### Users (Protected)

- `GET /users/me` – Current user
- `PATCH /users/me` – Update name, avatar

### Items

- `GET /items` – Public list
- `POST /items` – Create (protected) `{ name, weather: "hot"|"warm"|"cold", imageUrl }`
- `PUT /items/:itemId/likes` – Like (protected)
- `DELETE /items/:itemId/likes` – Unlike (protected)
- `DELETE /items/:itemId` – Owner-only delete (protected)

## Testing

### Smoke Test (Axios)

A single script that:

- signs up + signs in
- calls public and protected routes
- creates/likes/unlikes/deletes an item
- triggers error cases (401/400/404/403)

**Run:**

```bash
node utils/smokeTest.js
```

You'll see pretty-printed ✅/❌ statuses and response bodies.

### Jest E2E Tests

End-to-end tests that assert status codes and response shapes.

**Install & run:**

```bash
npm test
# or
npm run test
```

Tests live in `tests/api.spec.js`.  
Optionally point tests at a separate DB via `.env.test` (e.g., `wtwr_test`).

## Auth Flow

1. Client calls `POST /signin` with `{ email, password }`
2. Server validates and responds with `{ token }`
3. Client includes token on protected routes:
   ```
   Authorization: Bearer <token>
   ```
4. Public routes (`/signup`, `/signin`, `GET /items`) require no token

## Project Structure

```
.
├─ controllers/
│  ├─ clothingItems.js
│  └─ users.js
├─ docs/
│  └─ openapi.js          # OpenAPI spec (Swagger) generator
├─ middlewares/
│  ├─ auth.js             # JWT verification
│  └─ errorHandler.js     # central error responder
├─ models/
│  ├─ user.js
│  └─ clothingItem.js
├─ routes/
│  ├─ clothingItem.js
│  ├─ users.js
│  └─ index.js
├─ tests/
│  └─ api.spec.js         # Jest E2E
├─ utils/
│  ├─ errors.js           # AppError + mongoose mappers
│  └─ smokeTest.js        # Axios smoke script
└─ app.js
```

## Error Handling

Centralized in `middlewares/errorHandler.js`.

- Use `createError(kind, message)` in controllers/middleware to raise typed errors
- Common Mongoose errors are normalized via `mapMongooseError(err, {...})`, so:
  - duplicate keys → 409
  - validation → 400
  - bad ObjectId → 400
  - `.orFail()` → 404
- Responses are consistent JSON: `{ "message": "..." }`

## Linting

Configured with ESLint (Airbnb + Prettier). Notable rules:

**Allow Mongo `_id` usage:**

```json
"no-underscore-dangle": ["error", { "allow": ["_id"] }]
```

**Disabled globally (or use per-file overrides if preferred):**

```json
"no-console": "off",
"max-classes-per-file": "off"
```

**Run:**

```bash
npm run lint
```

## Notes / Tips

- **To export raw OpenAPI for SDK generation:**
  ```bash
  node scripts/export-openapi.js  # writes ./openapi.json
  ```
- Generate a TypeScript Axios SDK with OpenAPI Generator or roll your own minimal client (see `sdk/` if included)

// docs/openapi.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "WTWR API",
      version: "1.0.0",
      description: "JWT-secured API for users and clothing items",
    },
    servers: [{ url: "http://localhost:3001" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            name: { type: "string" },
            avatar: { type: "string", format: "uri" },
          },
        },
        SigninBody: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
        SignupBody: {
          type: "object",
          required: ["email", "password", "name", "avatar"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
            name: { type: "string" },
            avatar: { type: "string", format: "uri" },
          },
        },
        Item: {
          type: "object",
          properties: {
            _id: { type: "string" },
            name: { type: "string" },
            weather: { type: "string", enum: ["hot", "warm", "cold"] },
            imageUrl: { type: "string", format: "uri" },
            owner: { type: "string" },
            likes: { type: "array", items: { type: "string" } },
            createdAt: { type: "string", format: "date-time" },
          },
        },
      },
    },
    paths: {
      "/signup": {
        post: {
          summary: "Create user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SignupBody" },
              },
            },
          },
          responses: {
            201: {
              description: "Created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            409: { description: "Duplicate email" },
            400: { description: "Validation error" },
          },
        },
      },
      "/signin": {
        post: {
          summary: "Login and get JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SigninBody" },
              },
            },
          },
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: { token: { type: "string" } },
                  },
                },
              },
            },
            401: { description: "Invalid credentials" },
          },
        },
      },
      "/users/me": {
        get: {
          summary: "Get current user",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/User" },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        patch: {
          summary: "Update current user (name, avatar)",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    avatar: { type: "string", format: "uri" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "OK" },
            400: { description: "Validation" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
      },
      "/items": {
        get: {
          summary: "List items (public)",
          responses: {
            200: {
              description: "OK",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Item" },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: "Create item",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "weather", "imageUrl"],
                  properties: {
                    name: { type: "string" },
                    weather: { type: "string", enum: ["hot", "warm", "cold"] },
                    imageUrl: { type: "string", format: "uri" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Validation" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/items/{itemId}": {
        delete: {
          summary: "Delete item (owner only)",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Deleted" },
            400: { description: "Bad id" },
            401: { description: "Unauthorized" },
            403: { description: "Forbidden" },
            404: { description: "Not found" },
          },
        },
      },
      "/items/{itemId}/likes": {
        put: {
          summary: "Like item",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "OK" },
            400: { description: "Bad id" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
        delete: {
          summary: "Unlike item",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "itemId",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "OK" },
            400: { description: "Bad id" },
            401: { description: "Unauthorized" },
            404: { description: "Not found" },
          },
        },
      },
    },
  },
  // If you prefer JSDoc comments on route files, add them here:
  apis: [], // e.g., ['./routes/*.js']
};

const openapiSpec = swaggerJsdoc(options);
module.exports = { openapiSpec };

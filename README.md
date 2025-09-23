# WTWR (What to Wear?) - Backend API

A Node.js Express server for the WTWR application that helps users decide what to wear based on weather conditions. Built with Express.js and MongoDB using the Model-View-Controller (MVC) architecture.

## Features

- **User Management**: Create and manage user profiles
- **Clothing Items**: Add, view, and delete clothing items
- **Like System**: Like and unlike clothing items
- **Weather-based Recommendations**: Organize items by weather type (hot, warm, cold)

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB

## API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:userId` - Get user by ID
- `POST /users` - Create new user

### Clothing Items

- `GET /items` - Get all clothing items
- `POST /items` - Create new clothing item
- `DELETE /items/:itemId` - Delete clothing item
- `PUT /items/:itemId/likes` - Like an item
- `DELETE /items/:itemId/likes` - Unlike an item

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Run the server**

   ```bash
   npm start          # Production
   npm run dev        # Development with hot reload
   ```

3. **Lint the code**
   ```bash
   npm run lint
   ```

## Architecture

The project follows the MVC pattern:

- **Models** (`/models`) - Database schemas and data logic
- **Controllers** (`/controllers`) - Business logic and request handling
- **Routes** (`/routes`) - API endpoint definitions
- **Utils** (`/utils`) - Helper functions and error handling

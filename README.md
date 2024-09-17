# E-Commerce API

A robust, TypeScript-based e-commerce API built with Node.js, Express, and MongoDB. This API provides a solid foundation for building scalable e-commerce applications with features like user authentication, product management, and more.

## Table of Contents

- [Features](#features)
- [Technologies](#technologies)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [File Upload](#file-upload)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

## Features

- User registration and authentication (JWT)
- Role-based access control (Buyer/Seller)
- Product management (CRUD operations)
- Image upload for products
- Error handling and logging
- Input validation using Zod

## Technologies

- Node.js
- Express.js
- TypeScript
- MongoDB with Mongoose
- JSON Web Tokens (JWT) for authentication
- Multer for file uploads
- Zod for input validation
- Jest for testing (planned)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/stratpoint-training/ecom-project-nodejs.git
   ```

2. Install dependencies:
   ```
   cd e-commerce-api
   npm install
   ```

3. Create a `.env` file in the root directory and add the following:
   ```
   NODE_ENV=development
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=30d
   ```

### Configuration

- Database: Update the `MONGODB_URI` in the `.env` file with your MongoDB connection string.
- JWT: Set a strong `JWT_SECRET` for token encryption.

## API Endpoints

### User Routes

- `POST /api/users/register`: Register a new user
- `POST /api/users/login`: User login
- `GET /api/users/me`: Get current user profile

### Product Routes

- `GET /api/products`: Get all products
- `POST /api/products`: Create a new product (Seller only)
- `GET /api/products/:id`: Get a single product
- `PUT /api/products/:id`: Update a product (Seller only)
- `DELETE /api/products/:id`: Delete a product (Seller only)
- `GET /api/products/seller`: Get all products for the logged-in seller

## Authentication

This API uses JWT for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_token_here>
```

## Error Handling

The API implements centralized error handling and returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## File Upload

Product images can be uploaded using multipart/form-data. The API supports multiple image uploads per product.
Note: for development, pls create an `uploads` folder in root directory and give write access.

## Testing

(To be implemented) Run tests using:

```
npm test
```

## Future Enhancements

- Order management system
- Payment integration with Stripe
- Advanced product search and filtering
- User reviews and ratings
- Inventory management
- Email notifications
- Admin dashboard
- Performance optimizations and caching

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

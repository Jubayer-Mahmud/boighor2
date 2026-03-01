# BUETian's Boighor Backend

Production-ready Node.js + Express + MongoDB backend for the BUETian's Boighor e-commerce platform.

## Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **CORS**: Enabled for frontend communication
- **Environment**: dotenv

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # MongoDB connection configuration
│   ├── controllers/
│   │   ├── userController.js    # User auth & profile management
│   │   ├── adminController.js   # Admin auth & management
│   │   ├── productController.js # Product CRUD operations
│   │   ├── cartController.js    # Cart management
│   │   └── orderController.js   # Order management
│   ├── models/
│   │   ├── User.js              # User schema
│   │   ├── Admin.js             # Admin schema
│   │   ├── Product.js           # Product schema
│   │   ├── Cart.js              # Cart schema
│   │   └── Order.js             # Order schema
│   ├── routes/
│   │   ├── userRoutes.js        # User endpoints
│   │   ├── adminRoutes.js       # Admin endpoints
│   │   ├── productRoutes.js     # Product endpoints
│   │   ├── cartRoutes.js        # Cart endpoints
│   │   └── orderRoutes.js       # Order endpoints
│   └── middleware/
│       ├── auth.js              # JWT authentication
│       └── errorHandler.js      # Global error handling
├── server.js                    # Express app entry point
├── package.json                 # Dependencies
├── .env.example                 # Environment variables template
└── README.md                    # Documentation
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   ```

3. **Configure `.env`** with your values:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buetiams-boighor
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-secret-key
   JWT_EXPIRE=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start the server**:
   ```bash
   npm run dev    # Development with nodemon
   npm start      # Production
   ```

The server will be available at `http://localhost:5000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

### Response Format

All responses follow this format:
```json
{
  "message": "Success message",
  "data": {} // varies by endpoint
}
```

---

## User Endpoints

### Register User
- **POST** `/users/register`
- **Public** ✓
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "User registered successfully",
    "token": "eyJhbGc...",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
  ```

### Login User
- **POST** `/users/login`
- **Public** ✓
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response**: Same as register

### Get User Profile
- **GET** `/users/profile`
- **Protected** 🔒 (User)
- **Response**:
  ```json
  {
    "message": "User profile retrieved",
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01XXXXXXXXX",
      "address": "123 Street",
      "city": "Dhaka",
      "zipCode": "1234"
    }
  }
  ```

### Update User Profile
- **PUT** `/users/profile`
- **Protected** 🔒 (User)
- **Body** (all optional):
  ```json
  {
    "name": "Jane Doe",
    "phone": "01XXXXXXXXX",
    "address": "456 Street",
    "city": "Cumilla",
    "zipCode": "5678"
  }
  ```
- **Response**: Updated user object

---

## Admin Endpoints

### Register Admin
- **POST** `/admin/register`
- **Public** ✓
- **Body**:
  ```json
  {
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- **Response**: Token + admin object

### Login Admin
- **POST** `/admin/login`
- **Public** ✓
- **Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```
- **Response**: Token + admin object

### Get Admin Profile
- **GET** `/admin/profile`
- **Protected** 🔒 (Admin)
- **Response**: Admin object

---

## Product Endpoints

### Get All Products
- **GET** `/products`
- **Public** ✓
- **Query Parameters**:
  - `category`: Filter by category (fiction, non-fiction, poetry, drama, biography, self-help, academic, other)
  - `search`: Search in title and description
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**:
  ```json
  {
    "message": "Products retrieved successfully",
    "data": {
      "products": [
        {
          "_id": "...",
          "title": "Book Title",
          "description": "Description",
          "price": 500,
          "category": "fiction",
          "stock": 50,
          "image": "https://...",
          "rating": 4.5,
          "createdAt": "..."
        }
      ],
      "pagination": {
        "total": 100,
        "pages": 10,
        "currentPage": 1,
        "limit": 10
      }
    }
  }
  ```

### Get Product Categories
- **GET** `/products/categories`
- **Public** ✓
- **Response**:
  ```json
  {
    "message": "Categories retrieved successfully",
    "categories": ["fiction", "non-fiction", "poetry", ...]
  }
  ```

### Get Product by ID
- **GET** `/products/:id`
- **Public** ✓
- **Response**: Single product object with reviews

### Create Product
- **POST** `/products`
- **Protected** 🔒 (Admin)
- **Body**:
  ```json
  {
    "title": "Book Title",
    "description": "Detailed description",
    "price": 500,
    "category": "fiction",
    "stock": 50,
    "image": "https://example.com/image.jpg"
  }
  ```
- **Response**: Created product object

### Update Product
- **PUT** `/products/:id`
- **Protected** 🔒 (Admin)
- **Body** (all optional): Same fields as create
- **Response**: Updated product object

### Delete Product
- **DELETE** `/products/:id`
- **Protected** 🔒 (Admin)
- **Response**:
  ```json
  {
    "message": "Product deleted successfully"
  }
  ```

---

## Cart Endpoints

### Get Cart
- **GET** `/cart`
- **Protected** 🔒 (User)
- **Response**:
  ```json
  {
    "message": "Cart retrieved successfully",
    "cart": {
      "_id": "...",
      "user": "...",
      "items": [
        {
          "_id": "...",
          "product": {
            "_id": "...",
            "title": "Book Title",
            "price": 500
          },
          "quantity": 2,
          "price": 500
        }
      ],
      "totalPrice": 1000
    }
  }
  ```

### Add to Cart
- **POST** `/cart`
- **Protected** 🔒 (User)
- **Body**:
  ```json
  {
    "productId": "...",
    "quantity": 2
  }
  ```
- **Response**: Updated cart object

### Update Cart Item
- **PUT** `/cart`
- **Protected** 🔒 (User)
- **Body**:
  ```json
  {
    "productId": "...",
    "quantity": 5
  }
  ```
- **Response**: Updated cart object

### Remove from Cart
- **DELETE** `/cart/:productId`
- **Protected** 🔒 (User)
- **Response**: Updated cart object

### Clear Cart
- **DELETE** `/cart`
- **Protected** 🔒 (User)
- **Response**:
  ```json
  {
    "message": "Cart cleared successfully",
    "cart": { ... }
  }
  ```

---

## Order Endpoints

### Create Order
- **POST** `/orders`
- **Protected** 🔒 (User)
- **Body**:
  ```json
  {
    "shippingDetails": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "01XXXXXXXXX",
      "address": "123 Street",
      "city": "Dhaka",
      "zipCode": "1234"
    }
  }
  ```
- **Response**:
  ```json
  {
    "message": "Order created successfully",
    "order": {
      "_id": "...",
      "user": "...",
      "items": [...],
      "totalPrice": 1000,
      "shippingDetails": {...},
      "status": "pending",
      "createdAt": "..."
    }
  }
  ```

### Get User's Orders
- **GET** `/orders/user/orders`
- **Protected** 🔒 (User)
- **Response**: Array of order objects

### Get Order by ID
- **GET** `/orders/:id`
- **Protected** 🔒 (User - Own orders only)
- **Response**: Single order object

### Get All Orders (Admin)
- **GET** `/orders`
- **Protected** 🔒 (Admin)
- **Query Parameters**:
  - `status`: Filter by status (pending, processing, shipped, delivered, cancelled)
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
- **Response**: Paginated orders with user and product info

### Update Order Status
- **PUT** `/orders/:id/status`
- **Protected** 🔒 (Admin)
- **Body**:
  ```json
  {
    "status": "shipped"
  }
  ```
- **Response**: Updated order object

---

## Error Handling

All errors return standard format:
```json
{
  "message": "Error message"
}
```

Common error codes:
- `400`: Bad request (validation error, missing fields)
- `401`: Unauthorized (invalid token or credentials)
- `403`: Forbidden (insufficient permissions)
- `404`: Not found (resource doesn't exist)
- `500`: Server error

---

## Database Models

### User Schema
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `phone`: String (optional)
- `address`: String (optional)
- `city`: String (optional)
- `zipCode`: String (optional)
- `timestamps`: Created/Updated timestamps

### Admin Schema
- `name`: String (required)
- `email`: String (unique, required)
- `password`: String (hashed, required)
- `role`: String (enum: admin, super_admin)
- `timestamps`: Created/Updated timestamps

### Product Schema
- `title`: String (required)
- `description`: String (required)
- `price`: Number (required, min: 0)
- `category`: String (enum: fiction, non-fiction, poetry, etc.)
- `stock`: Number (default: 0)
- `image`: String (required - image URL)
- `rating`: Number (default: 0, 0-5)
- `reviews`: Array of review objects
- `timestamps`: Created/Updated timestamps

### Cart Schema
- `user`: ObjectId (ref: User, required)
- `items`: Array of cart items
  - `product`: ObjectId (ref: Product)
  - `quantity`: Number
  - `price`: Number
- `totalPrice`: Number (auto-calculated)
- `timestamps`: Created/Updated timestamps

### Order Schema
- `user`: ObjectId (ref: User, required)
- `items`: Array of order items
- `totalPrice`: Number (required)
- `shippingDetails`: Object with address info
- `status`: String (enum: pending, processing, shipped, delivered, cancelled)
- `timestamps`: Created/Updated timestamps

---

## Security Features

✓ Password hashing with bcrypt
✓ JWT token-based authentication
✓ CORS protection
✓ Input validation
✓ Error handling with sensitive data protection
✓ Role-based access control (Admin/User)
✓ Protected endpoints

---

## Development

### Available Scripts

```bash
npm run dev     # Start with nodemon (watch mode)
npm start       # Start production server
```

### Testing

You can use tools like:
- Postman - API testing
- Thunder Client - VS Code extension
- cURL - Command line

---

## Production Deployment

Before deploying to production:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use a process manager (PM2, Forever)
4. Set up MongoDB Atlas or self-hosted MongoDB
5. Configure CORS_ORIGIN to your frontend domain
6. Use HTTPS
7. Set strong JWT_SECRET

Example PM2 command:
```bash
pm2 start server.js --name "boighor-api"
```

---

## License

ISC

---

## Support

For issues and questions, contact the development team.

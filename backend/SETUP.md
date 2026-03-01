# Backend Setup Guide

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (Cloud or local)

## Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy the example file and update with your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# MongoDB URI - Get from MongoDB Atlas or local MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/buetiams-boighor?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-key-change-this-in-production
JWT_EXPIRE=7d

# CORS - Frontend URL
CORS_ORIGIN=http://localhost:3000
```

### 3. Start the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

You should see:
```
✓ MongoDB connected: cluster.mongodb.net
✓ Server running on http://localhost:5000
✓ Environment: development
```

### 4. Test the Server

Visit: `http://localhost:5000/health`

You should see:
```json
{ "message": "Server is running" }
```

## MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new project
4. Create a cluster
5. Create a database user
6. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/buetiams-boighor`
7. Add your IP to the whitelist (or allow all: 0.0.0.0/0)
8. Paste the connection string in `.env`

### Option 2: Local MongoDB

1. Install MongoDB
2. Start MongoDB service
3. Use connection string: `mongodb://localhost:27017/buetiams-boighor`

## Folder Structure

```
backend/
├── src/
│   ├── config/          # Database connection
│   ├── controllers/      # Business logic
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   └── middleware/      # Auth & error handling
├── server.js            # Express app
├── package.json         # Dependencies
├── .env.example         # Environment template
└── README.md            # API documentation
```

## Available API Endpoints

### Users
- `POST /api/users/register` - Create new user account
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update user profile (protected)

### Admin
- `POST /api/admin/register` - Create admin account
- `POST /api/admin/login` - Admin login
- `GET /api/admin/profile` - Get admin profile (protected)

### Products
- `GET /api/products` - Get all products (paginated, searchable)
- `GET /api/products/categories` - Get all categories
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Cart
- `GET /api/cart` - Get user cart (protected)
- `POST /api/cart` - Add to cart (protected)
- `PUT /api/cart` - Update cart item (protected)
- `DELETE /api/cart/:productId` - Remove from cart (protected)
- `DELETE /api/cart` - Clear cart (protected)

### Orders
- `POST /api/orders` - Create order (protected)
- `GET /api/orders/user/orders` - Get user orders (protected)
- `GET /api/orders/:id` - Get single order (protected)
- `GET /api/orders` - Get all orders (admin only)
- `PUT /api/orders/:id/status` - Update order status (admin only)

## Testing with Postman

### 1. Create User Account

Request:
```
POST http://localhost:5000/api/users/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### 2. Login User

Request:
```
POST http://localhost:5000/api/users/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### 3. Make Protected Request

Use the token from login/register response:

Request:
```
GET http://localhost:5000/api/users/profile
Authorization: Bearer <token>
```

### 4. Get Products

Request:
```
GET http://localhost:5000/api/products?category=fiction&limit=10
```

### 5. Create Product (Admin)

Request:
```
POST http://localhost:5000/api/products
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "title": "The Great Gatsby",
  "description": "A classic novel by F. Scott Fitzgerald",
  "price": 450,
  "category": "fiction",
  "stock": 50,
  "image": "https://example.com/gatsby.jpg"
}
```

## Frontend Integration

Update your Next.js frontend API service to use:

```javascript
const API_BASE_URL = 'http://localhost:5000/api';

// Save token after login
localStorage.setItem('token', response.token);

// Use token in requests
fetch(`${API_BASE_URL}/...`, {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
```

## Troubleshooting

### MongoDB Connection Error

**Error**: `MongoServerError: connect ECONNREFUSED 127.0.0.1:27017`

**Solution**:
- Check MongoDB is running
- Verify MONGODB_URI in `.env`
- For MongoDB Atlas, check IP whitelist

### CORS Error

**Error**: `Access to XMLHttpRequest blocked by CORS policy`

**Solution**:
- Update `CORS_ORIGIN` in `.env` to your frontend URL
- Default should be `http://localhost:3000`

### JWT Token Invalid

**Error**: `Invalid or expired token`

**Solution**:
- Send complete token: `Authorization: Bearer <token>`
- Check token hasn't expired (default 7 days)
- Verify JWT_SECRET hasn't changed

### Port Already in Use

**Error**: `listen EADDRINUSE :::5000`

**Solution**:
```bash
# Change PORT in .env to 5001 (or another port)
# Or kill the process using port 5000
# On Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## Performance Tips

1. **Enable compression**:
   ```javascript
   app.use(compression());
   ```

2. **Use connection pooling** - MongoDB does this by default

3. **Index frequently queried fields**:
   ```javascript
   schema.index({ email: 1 });
   ```

4. **Implement rate limiting**:
   ```bash
   npm install express-rate-limit
   ```

## Environment Variables Checklist

- [ ] MONGODB_URI set and verified
- [ ] JWT_SECRET changed from default
- [ ] CORS_ORIGIN matches frontend URL
- [ ] PORT not conflicting with other services
- [ ] NODE_ENV set appropriately (development/production)

## Next Steps

1. ✅ Backend running
2. → Connect frontend to backend
3. → Test all features
4. → Deploy to production
5. → Monitor and optimize

## Support

Check `README.md` for complete API documentation.

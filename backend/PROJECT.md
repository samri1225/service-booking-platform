# Service Booking Platform - Backend

## Project Overview
A multi-vendor service booking platform where:
- Customers can browse and book services (plumbing, tutoring, cleaning, etc.)
- Providers can create profiles and manage bookings
- Admins can oversee the entire platform

## Tech Stack
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose ODM)
- Authentication: JWT (jsonwebtoken)
- Payments: Stripe API
- Email: Nodemailer

## Project Structure
backend/
├── src/
│ ├── config/
│ │ └── db.js # MongoDB connection
│ ├── models/
│ │ ├── User.js # User schema (roles: customer, provider, admin)
│ │ ├── Service.js # Service listings
│ │ └── Booking.js # Booking management
│ ├── controllers/
│ │ └── authController.js # Auth logic (register, login, getMe)
│ ├── routes/
│ │ └── authRoutes.js # Auth API endpoints
│ └── middleware/
│ └── auth.js # JWT authentication & authorization
├── .env # Environment variables
├── server.js # Main entry point
└── package.json # Dependencies

## Current Status
✅ Folder structure created
✅ Dependencies installed
✅ Basic server setup
✅ User model created
❌ Need to complete authController.js
❌ Need to complete authRoutes.js
❌ Need to test with Postman

## Next Task
Complete the authentication system (register, login, protected routes)
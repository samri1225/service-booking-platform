# 🚀 Service Booking Platform

A full-stack MERN service booking platform built for the Ethiopian market, connecting customers with verified service providers.

## 🌐 Live Demo

- **Frontend:** Coming soon (Vercel)
- **Backend API:** Coming soon (Render)

### 🔑 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 👤 Customer | `test@example.com` | `password123` |
| 🔧 Provider | `provider@example.com` | `password123` |
| 👑 Admin | `admin@example.com` | `admin123` |

## ✨ Features

### Customer
- Browse and search services
- Book services with Ethiopian time
- Track and manage bookings
- Rate and review providers

### Provider
- Create and manage services
- Accept, decline, and complete bookings
- Set weekly availability and blocked dates
- Track earnings

### Admin
- Manage all users
- Approve/reject providers
- View platform analytics
- Monitor revenue and commissions

### Ethiopian Localization 🇪🇹
- Ethiopian Birr (ETB) currency
- East Africa Time (EAT, UTC+3)
- 12-hour time format

## 🛠️ Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Nodemailer, bcryptjs

**Frontend:** React 19, Vite, Tailwind CSS, React Router v7, Axios

**Hosting:** MongoDB Atlas, Render, Vercel

## 📁 Project Structure
service-booking-platform/
├── backend/
│ ├── src/
│ │ ├── config/ # Database config
│ │ ├── controllers/ # Route handlers
│ │ ├── models/ # Mongoose schemas
│ │ ├── routes/ # API routes
│ │ ├── middleware/ # Auth middleware
│ │ └── utils/ # Helpers (email, locale)
│ └── server.js
└── frontend/
├── src/
│ ├── components/ # React components
│ ├── api/ # Axios config
│ └── utils/ # Helpers
└── vite.config.js


## 🚀 Local Setup

```bash
# Clone the repo
git clone https://github.com/samri1225/service-booking-platform.git
cd service-booking-platform

# Backend setup
cd backend
npm install
# Create .env with your credentials
npm run dev

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
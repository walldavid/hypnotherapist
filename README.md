# Hypnotherapist E-commerce Platform

A full-stack e-commerce web application for selling digital hypnotherapy products (courses, audio files, PDFs).

## 🚀 Technology Stack

- **Frontend**: React
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **Payment Processing**: Stripe + PayPal
- **File Storage**: AWS S3
- **Authentication**: JWT

## 📋 Features

- Product catalog with search and filtering
- Shopping cart and secure checkout
- Dual payment gateway support (Stripe & PayPal)
- Simple account system for purchase tracking
- Secure, time-limited download links
- Admin dashboard for product management
- Email notifications for orders
- Responsive, mobile-first design

## 🏗️ Project Structure

```
hypnotherapist/
├── client/          # React frontend application
├── server/          # Node.js/Express backend API
└── README.md
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas account)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/walldavid/hypnotherapist.git
cd hypnotherapist
```

2. Install dependencies for all packages:
```bash
npm run install-all
```

3. Set up environment variables:
```bash
cd server
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB locally (if not using Atlas)

5. Run the development servers:
```bash
npm run dev
```

This will start:
- Backend API on http://localhost:5000
- Frontend React app on http://localhost:3000

### Available Scripts

- `npm run dev` - Run both client and server concurrently
- `npm run client` - Run only the React frontend
- `npm run server` - Run only the Express backend
- `npm run install-all` - Install all dependencies

## 📝 License

Copyright © 2026 - All rights reserved

## 👨‍⚕️ About

Built for www.hypnotherapist.ie - Professional hypnotherapy services and digital products.

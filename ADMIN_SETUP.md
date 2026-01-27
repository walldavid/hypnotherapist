# Admin Setup Guide

This guide explains how to create and log in as an admin user.

## Prerequisites

You need **MongoDB** running to create admin users. The application stores user data in MongoDB.

## Option 1: Local MongoDB (Recommended for Development)

### Install MongoDB on Mac:

```bash
# Install MongoDB with Homebrew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify it's running
brew services list | grep mongodb
```

### Install MongoDB on Other Systems:

- **Windows**: Download from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
- **Linux**: Follow instructions at [mongodb.com/docs/manual/administration/install-on-linux/](https://www.mongodb.com/docs/manual/administration/install-on-linux/)

### Configure MongoDB URI:

Edit `server/.env` and uncomment the MongoDB URI:

```bash
MONGODB_URI=mongodb://localhost:27017/hypnotherapist
```

## Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account
3. Create a new cluster (free M0 tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Edit `server/.env` and add:

```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hypnotherapist?retryWrites=true&w=majority
```

Replace `username` and `password` with your Atlas credentials.

## Create Admin User

Once MongoDB is configured and running:

```bash
cd server
npm run create-admin
```

This will create an admin user with:

```
Username: admin
Email: admin@hypnotherapist.ie  
Password: Admin123!
```

## Login to Admin Dashboard

1. Start the application:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

2. Open your browser to: **http://localhost:3000/admin/login**

3. Login with:
   - **Username**: `admin`
   - **Password**: `Admin123!`

4. You'll be redirected to the admin dashboard at `/admin/dashboard`

## Admin Features

Once logged in, you can:

- **Dashboard** (`/admin/dashboard`)
  - View total products, orders, revenue
  - See recent orders
  - Quick access to management pages

- **Products Manager** (`/admin/products`)
  - Add new products
  - Edit existing products
  - Delete products
  - Upload product files (requires GCS setup)

- **Orders Manager** (`/admin/orders`)
  - View all orders
  - Filter by status (pending, processing, completed, cancelled)
  - View order details
  - See download token information

## Troubleshooting

### "MONGODB_URI not configured"

- Make sure you edited `server/.env` and added `MONGODB_URI`
- Make sure MongoDB is running: `brew services list` (Mac)

### "Connection refused" or "ECONNREFUSED"

- MongoDB isn't running. Start it with: `brew services start mongodb-community`
- Or check if Atlas IP whitelist includes your IP

### "Admin user already exists"

- You've already created an admin user
- Use the existing credentials to log in
- To reset, delete the admin from MongoDB:

```bash
# Using MongoDB shell
mongosh hypnotherapist
db.admins.deleteOne({ username: "admin" })
exit

# Then run create-admin again
npm run create-admin
```

### Can't Login - "Invalid credentials"

- Make sure you're using the correct username/password
- Username is case-sensitive: use `admin` (lowercase)
- Default password: `Admin123!` (capital A, ends with !)

### "Account is locked"

- After 5 failed login attempts, accounts lock for 2 hours
- Wait 2 hours or delete and recreate the admin user

## Security Notes

⚠️ **Important Security Recommendations:**

1. **Change Default Password**: The default `Admin123!` password should be changed immediately after first login
   - *Note: Password change feature needs to be implemented*

2. **Strong Passwords**: Use passwords with:
   - At least 8 characters
   - Mix of uppercase and lowercase
   - Numbers and special characters

3. **Production**: 
   - Never use default credentials in production
   - Use strong, unique passwords
   - Consider implementing 2FA in the future

## Next Steps

After logging in:

1. ✅ Test the admin dashboard
2. ✅ Try creating a test product
3. ⚠️ Set up Google Cloud Storage to enable file uploads
4. ⚠️ Configure Stripe/PayPal for payment testing
5. ⚠️ Set up email service for order notifications

See `GCS_SETUP.md`, `PAYMENT_SETUP.md`, and `EMAIL_SETUP.md` for detailed instructions.

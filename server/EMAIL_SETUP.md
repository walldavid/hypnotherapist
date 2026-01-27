# Email Configuration Guide

This guide explains how to set up email notifications for order confirmations and admin alerts.

## Overview

The application uses **Nodemailer** for sending emails, which supports:
- Gmail (with App Passwords)
- SendGrid SMTP
- Outlook/Office365
- Any custom SMTP server

## Quick Setup Options

### Option 1: Gmail (Recommended for Testing)

1. **Enable 2-Factor Authentication** on your Gmail account:
   - Go to: https://myaccount.google.com/security
   - Enable 2-Step Verification

2. **Create an App Password**:
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Click "Generate"
   - Copy the 16-character password

3. **Update your `.env` file**:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ADMIN_EMAIL=admin@hypnotherapist.ie
   CLIENT_URL=http://localhost:3000
   ```

### Option 2: SendGrid (Recommended for Production)

1. **Create a SendGrid account**:
   - Sign up at: https://sendgrid.com/
   - Free tier: 100 emails/day

2. **Create an API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Select "Restricted Access" → "Mail Send" → "Full Access"
   - Copy the API key

3. **Update your `.env` file**:
   ```env
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your-sendgrid-api-key-here
   ADMIN_EMAIL=admin@hypnotherapist.ie
   CLIENT_URL=http://localhost:3000
   ```

### Option 3: Outlook/Office365

1. **Update your `.env` file**:
   ```env
   EMAIL_HOST=smtp.office365.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_USER=your-email@outlook.com
   EMAIL_PASSWORD=your-password
   ADMIN_EMAIL=admin@hypnotherapist.ie
   CLIENT_URL=http://localhost:3000
   ```

### Option 4: Custom Domain Email

If you have your own domain with email hosting:

```env
EMAIL_HOST=mail.yourdomain.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=noreply@yourdomain.com
EMAIL_PASSWORD=your-password
ADMIN_EMAIL=admin@yourdomain.com
CLIENT_URL=https://hypnotherapist.ie
```

## Testing Email Configuration

### 1. Test Email Sending

Create a test script `test-email.js`:

```javascript
require('dotenv').config();
const emailService = require('./services/emailService');

async function testEmail() {
  const testOrder = {
    orderNumber: 'TEST123',
    customerEmail: 'customer@example.com',
    totalAmount: 49.99,
    items: [
      { name: 'Test Product', price: 49.99 }
    ],
    downloads: [
      {
        productName: 'Test Product',
        token: 'test-token-12345',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        maxDownloads: 5
      }
    ],
    paymentMethod: 'stripe',
    createdAt: new Date()
  };

  const result = await emailService.sendOrderConfirmation(testOrder);
  console.log('Email test result:', result);
}

testEmail().catch(console.error);
```

Run the test:
```bash
node test-email.js
```

### 2. Check Email Logs

The application logs email sending attempts:
- ✅ Success: "Order confirmation email sent to..."
- ⚠️ Not configured: "Email not configured - skipping..."
- ❌ Error: "Error sending order confirmation email:..."

## Email Types

### 1. Order Confirmation Email

**Sent to:** Customer
**When:** After successful payment
**Contains:**
- Order number and details
- Download links for each product
- Expiry information
- Order summary with total

### 2. Admin Notification Email

**Sent to:** Admin (ADMIN_EMAIL)
**When:** After successful payment
**Contains:**
- Order number
- Customer email
- Products purchased
- Total amount
- Link to admin dashboard

## Important Notes

### Gmail Limitations

- **Daily limit:** 500 emails/day for free accounts
- **Rate limit:** Don't send more than 10 emails/second
- **App passwords:** Required if 2FA is enabled
- **Less secure apps:** Don't use this option (deprecated)

### SendGrid Benefits

- ✅ Better deliverability
- ✅ Email analytics
- ✅ Higher sending limits
- ✅ Professional sender reputation
- ✅ Webhook support for bounces/opens

### Production Recommendations

1. **Use SendGrid or similar service** (not Gmail)
2. **Set up SPF, DKIM, and DMARC** records for your domain
3. **Use a custom from email** (e.g., noreply@hypnotherapist.ie)
4. **Monitor bounce rates** and unsubscribes
5. **Test emails** before going live

## Troubleshooting

### Email not sending?

1. **Check configuration**:
   ```bash
   # Verify .env file has all required fields
   grep EMAIL server/.env
   ```

2. **Check logs**:
   - Look for "Email not configured" messages
   - Check for connection errors

3. **Test SMTP connection**:
   ```javascript
   const transport = nodemailer.createTransport({...});
   await transport.verify();
   console.log('SMTP connection successful!');
   ```

### Common Errors

**"Invalid login"**
- Gmail: Use App Password, not account password
- Check EMAIL_USER and EMAIL_PASSWORD are correct

**"Connection timeout"**
- Check EMAIL_HOST and EMAIL_PORT
- Ensure firewall allows outbound SMTP

**"Self-signed certificate"**
- Set `EMAIL_SECURE=false` for port 587
- Set `EMAIL_SECURE=true` for port 465

**"Mailbox unavailable"**
- Verify the customer email is valid
- Check ADMIN_EMAIL is set correctly

### Gmail "Less Secure Apps" Error

Gmail has deprecated "less secure apps" access. **Solutions:**
1. Use App Passwords (recommended)
2. Use OAuth2 (complex setup)
3. Switch to SendGrid

## Email Templates

Email templates are defined in `services/emailService.js`. To customize:

1. Edit the HTML in `sendOrderConfirmation` function
2. Update colors, logos, and branding
3. Test changes with `test-email.js`

## Security Best Practices

1. **Never commit `.env` file** to Git
2. **Use App Passwords** instead of real passwords
3. **Rotate credentials** regularly
4. **Monitor for spam reports**
5. **Implement unsubscribe** links (if sending marketing emails)

## Support

If you have issues:
1. Check the console logs for error messages
2. Verify .env configuration
3. Test with Gmail first (easiest to set up)
4. Review Nodemailer documentation: https://nodemailer.com/

## Example Working Configuration

```env
# Gmail with App Password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=hypnotherapist.ie@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=admin@hypnotherapist.ie
CLIENT_URL=http://localhost:3000
```

Replace `abcd efgh ijkl mnop` with your actual 16-character App Password (spaces are okay).

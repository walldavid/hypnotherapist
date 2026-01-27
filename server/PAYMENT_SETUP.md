# Payment Integration Setup Guide

This guide walks you through setting up Stripe and PayPal payment processing.

## Stripe Setup

### 1. Create a Stripe Account

1. Go to [stripe.com](https://stripe.com) and sign up
2. Complete account verification

### 2. Get API Keys

1. Go to [Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

**For Testing:** Use test mode keys (they have `_test_` in them)

### 3. Configure Webhook

1. Go to [Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Endpoint URL: `https://your-domain.com/api/payment/stripe/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Signing secret** (starts with `whsec_`)

### 4. Update Environment Variables

Edit `server/.env`:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 5. Test with Stripe Test Cards

Use these test card numbers in Stripe Checkout:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC.

---

## PayPal Setup

### 1. Create PayPal Developer Account

1. Go to [developer.paypal.com](https://developer.paypal.com)
2. Sign up or login with existing PayPal account

### 2. Create Sandbox App

1. Go to [My Apps & Credentials](https://developer.paypal.com/dashboard/applications/sandbox)
2. Click **Create App**
3. Name: `Hypnotherapist Payments`
4. App Type: **Merchant**
5. Click **Create App**

### 3. Get API Credentials

From your app page:

1. Copy **Client ID**
2. Copy **Secret** (click "Show" to reveal)

### 4. Create Sandbox Accounts

PayPal Developer automatically creates:
- **Business Account** (merchant - receives payments)
- **Personal Account** (buyer - makes payments)

Go to [Sandbox Accounts](https://developer.paypal.com/dashboard/accounts) to view credentials.

### 5. Configure Webhook (Optional)

1. Go to your app settings
2. Scroll to **Webhooks**
3. Add webhook URL: `https://your-domain.com/api/payment/paypal/webhook`
4. Select events:
   - `PAYMENT.CAPTURE.COMPLETED`
   - `PAYMENT.CAPTURE.REFUNDED`
5. Save the webhook ID

### 6. Update Environment Variables

Edit `server/.env`:

```bash
# PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # Use 'live' for production
PAYPAL_WEBHOOK_ID=your_webhook_id  # Optional
```

### 7. Test with Sandbox Accounts

Use the sandbox personal account credentials to test payments:
- Login to PayPal Checkout with sandbox buyer email
- Password from sandbox accounts page
- Make test purchases

---

## Testing the Integration

### 1. Start the Server

```bash
cd server
npm run dev
```

### 2. Create an Order

```bash
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "customerEmail": "test@example.com",
  "customerName": "Test Customer",
  "items": [
    {
      "product": "PRODUCT_ID_HERE",
      "quantity": 1
    }
  ],
  "paymentMethod": "stripe"
}
```

Save the returned `orderId`.

### 3. Create Stripe Checkout

```bash
POST http://localhost:5000/api/payment/stripe/create-checkout-session
Content-Type: application/json

{
  "orderId": "ORDER_ID_FROM_STEP_2"
}
```

Visit the returned `url` to complete payment with test card.

### 4. Create PayPal Order

```bash
POST http://localhost:5000/api/payment/paypal/create-order
Content-Type: application/json

{
  "orderId": "ORDER_ID_FROM_STEP_2"
}
```

Use the returned PayPal order ID to complete payment.

---

## Webhook Testing (Local Development)

### Option 1: Stripe CLI

1. Install [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Login: `stripe login`
3. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:5000/api/payment/stripe/webhook
   ```
4. Use the webhook secret from CLI output in `.env`

### Option 2: ngrok

1. Install [ngrok](https://ngrok.com/)
2. Start tunnel:
   ```bash
   ngrok http 5000
   ```
3. Use the ngrok URL in Stripe/PayPal webhook settings
4. Update webhook endpoints to use ngrok URL

---

## Production Checklist

### Stripe
- [ ] Switch to live API keys (remove `_test_`)
- [ ] Update webhook endpoint to production URL
- [ ] Enable 3D Secure for European customers
- [ ] Set up Stripe Radar for fraud detection
- [ ] Configure email receipts in Stripe Dashboard

### PayPal
- [ ] Switch to live credentials
- [ ] Change `PAYPAL_MODE` to `live`
- [ ] Update webhook endpoint to production URL
- [ ] Complete business verification
- [ ] Set up automatic transfers to bank account

### General
- [ ] Test full payment flow in production mode
- [ ] Set up monitoring for failed payments
- [ ] Configure refund policies
- [ ] Test webhook reliability
- [ ] Document customer support procedures

---

## Troubleshooting

### Stripe Issues

**"No such checkout session"**
- Verify `STRIPE_SECRET_KEY` is correct
- Check that order ID is valid
- Ensure using same environment (test/live)

**Webhook signature verification failed**
- Verify `STRIPE_WEBHOOK_SECRET` matches dashboard
- Ensure raw body is passed to webhook handler
- Check webhook is receiving events in Stripe Dashboard

### PayPal Issues

**"Authentication failed"**
- Verify Client ID and Secret are correct
- Check `PAYPAL_MODE` matches credentials (sandbox/live)
- Ensure credentials are from correct app

**"Order not found"**
- Verify orderId is being passed correctly
- Check PayPal order was created successfully
- Ensure capturing correct PayPal order ID

### General Issues

**Payment succeeds but order not updated**
- Check server logs for webhook errors
- Verify webhook endpoints are publicly accessible
- Test webhook delivery in payment provider dashboard
- Check database connection

**Files not downloadable after payment**
- Verify download tokens are generated
- Check GCS is configured correctly
- Ensure email contains correct download links

---

## Security Best Practices

1. **Never expose secret keys in client code**
2. **Always verify webhook signatures**
3. **Use HTTPS in production**
4. **Implement rate limiting on payment endpoints**
5. **Log all payment events for audit trail**
6. **Set up alerts for failed payments**
7. **Regularly rotate API keys**
8. **Keep SDKs updated**
9. **Handle PCI compliance (Stripe/PayPal handle card data)**
10. **Implement fraud detection**

---

## Support Resources

- **Stripe Docs**: https://stripe.com/docs
- **Stripe Support**: https://support.stripe.com
- **PayPal Docs**: https://developer.paypal.com/docs
- **PayPal Support**: https://www.paypal.com/merchantsupport

---

## Cost Information

### Stripe
- **EU Cards**: 1.5% + €0.25 per transaction
- **Non-EU Cards**: 2.5% + €0.25 per transaction
- **No setup fees or monthly fees**

### PayPal
- **Domestic**: 1.9% + €0.35 per transaction
- **International**: 3.4% + €0.35 per transaction
- **No setup fees or monthly fees**

*Rates may vary - check official websites for current pricing*

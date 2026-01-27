const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Stripe
router.post('/stripe/create-checkout-session', paymentController.createStripeCheckout);
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), paymentController.handleStripeWebhook);

// PayPal
router.post('/paypal/create-order', paymentController.createPayPalOrder);
router.post('/paypal/capture-order', paymentController.capturePayPalOrder);
router.post('/paypal/webhook', paymentController.handlePayPalWebhook);

module.exports = router;

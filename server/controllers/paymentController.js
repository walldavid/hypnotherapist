const Order = require('../models/Order');
const stripeService = require('../services/stripeService');
const paypalService = require('../services/paypalService');

// Stripe checkout
exports.createStripeCheckout = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!stripeService.isConfigured()) {
      return res.status(503).json({ 
        error: 'Stripe payment is not configured' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const successUrl = `${clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${clientUrl}/payment/cancel?order_id=${orderId}`;

    const session = await stripeService.createCheckoutSession(
      orderId,
      successUrl,
      cancelUrl
    );

    res.json({
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature header' });
    }

    // Verify webhook signature
    let event;
    try {
      event = stripeService.verifyWebhook(req.body, signature);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    console.log('Stripe webhook event:', event.type);

    // Handle event types
    switch (event.type) {
      case 'checkout.session.completed':
        await stripeService.handlePaymentSuccess(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await stripeService.handlePaymentFailure(event.data.object);
        break;

      case 'charge.refunded':
        // Handle refund if needed
        console.log('Refund processed:', event.data.object.id);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling Stripe webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

// PayPal create order
exports.createPayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!paypalService.isConfigured()) {
      return res.status(503).json({ 
        error: 'PayPal payment is not configured' 
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paypalOrder = await paypalService.createPayPalOrder(orderId);

    res.json({
      id: paypalOrder.id,
      status: paypalOrder.status,
      links: paypalOrder.links
    });
  } catch (error) {
    next(error);
  }
};

// Capture PayPal order
exports.capturePayPalOrder = async (req, res, next) => {
  try {
    const { paypalOrderId } = req.body;

    if (!paypalService.isConfigured()) {
      return res.status(503).json({ 
        error: 'PayPal payment is not configured' 
      });
    }

    const captureData = await paypalService.capturePayPalOrder(paypalOrderId);

    // Handle successful payment
    if (captureData.status === 'COMPLETED') {
      await paypalService.handlePaymentSuccess(captureData);
    }

    res.json({
      id: captureData.id,
      status: captureData.status,
      payer: captureData.payer
    });
  } catch (error) {
    next(error);
  }
};

// Handle PayPal webhook
exports.handlePayPalWebhook = async (req, res, next) => {
  try {
    // Verify webhook signature
    const isValid = await paypalService.verifyWebhook(req.headers, req.body);

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log('PayPal webhook event:', event.event_type);

    // Handle event types
    switch (event.event_type) {
      case 'CHECKOUT.ORDER.COMPLETED':
      case 'PAYMENT.CAPTURE.COMPLETED':
        // Payment already handled in capturePayPalOrder
        console.log('PayPal payment completed:', event.resource?.id);
        break;

      case 'PAYMENT.CAPTURE.REFUNDED':
        console.log('PayPal refund processed:', event.resource?.id);
        break;

      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling PayPal webhook:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
};

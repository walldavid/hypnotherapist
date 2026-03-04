// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const orders = require('../collections/orders');
const products = require('../collections/products');
const users = require('../collections/users');

/**
 * Create Stripe checkout session
 */
exports.createCheckoutSession = async (orderId, successUrl, cancelUrl) => {
  try {
    const order = await orders.getById(orderId);
    if (!order) throw new Error('Order not found');

    const lineItems = order.items.map(item => ({
      price_data: {
        currency: (order.currency || 'eur').toLowerCase(),
        product_data: { name: item.productName },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: order.customerEmail,
      client_reference_id: orderId,
      metadata: { orderId, orderNumber: order.orderNumber },
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

/**
 * Verify Stripe webhook signature
 */
exports.verifyWebhook = (payload, signature) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error('Stripe webhook secret not configured');
  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
};

/**
 * Handle successful payment
 */
exports.handlePaymentSuccess = async (session) => {
  try {
    const orderId = session.client_reference_id || session.metadata?.orderId;
    if (!orderId) throw new Error('Order ID not found in session');

    const order = await orders.getById(orderId);
    if (!order) throw new Error('Order not found');

    await orders.update(orderId, {
      paymentStatus: 'completed',
      status: 'completed',
      paymentDetails: {
        stripePaymentIntentId: session.payment_intent,
        transactionId: session.id,
        paidAt: new Date().toISOString(),
      },
    });

    // Generate download tokens
    const { generateDownloadTokens } = require('../controllers/orderController');
    await generateDownloadTokens(orderId);

    // Update product sales counts
    for (const item of order.items) {
      await products.incrementSalesCount(item.product, item.quantity);
    }

    // Update user total spent
    await users.incrementTotalSpent(order.customerEmail, order.total);

    // Send emails
    const emailService = require('./emailService');
    const updatedOrder = await orders.getById(orderId);
    await emailService.sendOrderConfirmation(updatedOrder);
    await emailService.sendAdminNotification(updatedOrder);

    return updatedOrder;
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 */
exports.handlePaymentFailure = async (paymentIntent) => {
  try {
    const order = await orders.findByStripePaymentIntent(paymentIntent.id);
    if (!order) {
      console.log('Order not found for failed payment:', paymentIntent.id);
      return null;
    }

    await orders.update(order.id, {
      paymentStatus: 'failed',
      status: 'cancelled',
      notes: paymentIntent.last_payment_error?.message || 'Payment failed',
    });

    return orders.getById(order.id);
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
    throw error;
  }
};

/**
 * Create refund
 */
exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = { payment_intent: paymentIntentId };
    if (amount) refundData.amount = Math.round(amount * 100);
    return await stripe.refunds.create(refundData);
  } catch (error) {
    console.error('Error creating Stripe refund:', error);
    throw error;
  }
};

exports.isConfigured = () => !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);

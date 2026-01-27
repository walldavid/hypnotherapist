// Initialize Stripe only if API key is provided
const stripe = process.env.STRIPE_SECRET_KEY 
  ? require('stripe')(process.env.STRIPE_SECRET_KEY)
  : null;

const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Create Stripe checkout session
 * @param {string} orderId - Order ID
 * @param {string} successUrl - Success redirect URL
 * @param {string} cancelUrl - Cancel redirect URL
 * @returns {Promise<Object>} - Stripe session
 */
exports.createCheckoutSession = async (orderId, successUrl, cancelUrl) => {
  try {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new Error('Order not found');
    }

    // Create line items for Stripe
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: order.currency.toLowerCase(),
        product_data: {
          name: item.productName,
          description: item.product?.shortDescription || item.product?.description?.substring(0, 100),
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: order.customerEmail,
      client_reference_id: orderId,
      metadata: {
        orderId: orderId,
        orderNumber: order.orderNumber,
      },
    });

    return session;
  } catch (error) {
    console.error('Error creating Stripe checkout session:', error);
    throw error;
  }
};

/**
 * Verify Stripe webhook signature
 * @param {Buffer} payload - Raw request body
 * @param {string} signature - Stripe signature header
 * @returns {Object} - Verified event
 */
exports.verifyWebhook = (payload, signature) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );

    return event;
  } catch (error) {
    console.error('Error verifying Stripe webhook:', error);
    throw error;
  }
};

/**
 * Handle successful payment
 * @param {Object} session - Stripe checkout session
 * @returns {Promise<Object>} - Updated order
 */
exports.handlePaymentSuccess = async (session) => {
  try {
    const orderId = session.client_reference_id || session.metadata?.orderId;

    if (!orderId) {
      throw new Error('Order ID not found in session');
    }

    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Update order status
    order.paymentStatus = 'completed';
    order.status = 'completed';
    order.paymentDetails = {
      ...order.paymentDetails,
      stripePaymentIntentId: session.payment_intent,
      transactionId: session.id,
      paidAt: new Date(),
    };

    await order.save();

    // Import here to avoid circular dependency
    const { generateDownloadTokens } = require('../controllers/orderController');
    const User = require('../models/User');

    // Generate download tokens
    await generateDownloadTokens(orderId);

    // Update product sales counts
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { salesCount: item.quantity }
      });
    }

    // Update user total spent
    await User.findOneAndUpdate(
      { email: order.customerEmail },
      { $inc: { totalSpent: order.total } }
    );

    // Send confirmation email
    const emailService = require('./emailService');
    await emailService.sendOrderConfirmation(order);
    
    // Send admin notification
    await emailService.sendAdminNotification(order);

    return order;
  } catch (error) {
    console.error('Error handling Stripe payment success:', error);
    throw error;
  }
};

/**
 * Handle failed payment
 * @param {Object} paymentIntent - Stripe payment intent
 * @returns {Promise<Object>} - Updated order
 */
exports.handlePaymentFailure = async (paymentIntent) => {
  try {
    // Find order by payment intent ID
    const order = await Order.findOne({
      'paymentDetails.stripePaymentIntentId': paymentIntent.id
    });

    if (!order) {
      console.log('Order not found for failed payment:', paymentIntent.id);
      return null;
    }

    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.notes = paymentIntent.last_payment_error?.message || 'Payment failed';

    await order.save();

    return order;
  } catch (error) {
    console.error('Error handling Stripe payment failure:', error);
    throw error;
  }
};

/**
 * Create refund
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund (optional, full refund if not provided)
 * @returns {Promise<Object>} - Stripe refund
 */
exports.createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundData = {
      payment_intent: paymentIntentId,
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Convert to cents
    }

    const refund = await stripe.refunds.create(refundData);

    return refund;
  } catch (error) {
    console.error('Error creating Stripe refund:', error);
    throw error;
  }
};

/**
 * Check if Stripe is configured
 * @returns {boolean}
 */
exports.isConfigured = () => {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
};

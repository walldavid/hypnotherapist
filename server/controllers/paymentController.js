const Order = require('../models/Order');
const { generateDownloadTokens } = require('./orderController');
const emailService = require('../services/emailService');

// Stripe checkout (placeholder - needs Stripe SDK)
exports.createStripeCheckout = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // TODO: Implement Stripe checkout session
    // Will need: npm install stripe
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const session = await stripe.checkout.sessions.create({ ... });

    res.status(501).json({ 
      message: 'Stripe integration not yet implemented',
      orderId: order._id 
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    // TODO: Implement Stripe webhook verification
    // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    // Handle event types
    // switch (event.type) {
    //   case 'checkout.session.completed':
    //     await handlePaymentSuccess(event.data.object);
    //     break;
    //   case 'payment_intent.payment_failed':
    //     await handlePaymentFailure(event.data.object);
    //     break;
    // }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// PayPal create order (placeholder)
exports.createPayPalOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // TODO: Implement PayPal order creation
    // Will need: npm install @paypal/checkout-server-sdk

    res.status(501).json({ 
      message: 'PayPal integration not yet implemented',
      orderId: order._id 
    });
  } catch (error) {
    next(error);
  }
};

// Capture PayPal order (placeholder)
exports.capturePayPalOrder = async (req, res, next) => {
  try {
    const { paypalOrderId, orderId } = req.body;

    // TODO: Implement PayPal order capture

    res.status(501).json({ message: 'PayPal capture not yet implemented' });
  } catch (error) {
    next(error);
  }
};

// Handle PayPal webhook
exports.handlePayPalWebhook = async (req, res, next) => {
  try {
    // TODO: Implement PayPal webhook verification

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Helper function to handle successful payment
async function handlePaymentSuccess(orderId, paymentDetails) {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Update order
    order.paymentStatus = 'completed';
    order.status = 'completed';
    order.paymentDetails = {
      ...order.paymentDetails,
      ...paymentDetails,
      paidAt: new Date()
    };

    await order.save();

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
    await emailService.sendOrderConfirmation(order);

    return order;
  } catch (error) {
    console.error('Error handling payment success:', error);
    throw error;
  }
}

// Helper function to handle payment failure
async function handlePaymentFailure(orderId, reason) {
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      throw new Error('Order not found');
    }

    order.paymentStatus = 'failed';
    order.status = 'cancelled';
    order.notes = reason || 'Payment failed';

    await order.save();

    return order;
  } catch (error) {
    console.error('Error handling payment failure:', error);
    throw error;
  }
}

module.exports.handlePaymentSuccess = handlePaymentSuccess;
module.exports.handlePaymentFailure = handlePaymentFailure;

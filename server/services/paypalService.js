const paypal = require('@paypal/checkout-server-sdk');
const Order = require('../models/Order');
const Product = require('../models/Product');

// Configure PayPal environment
let paypalClient;

try {
  const environment = process.env.PAYPAL_MODE === 'live'
    ? new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      )
    : new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET
      );

  paypalClient = new paypal.core.PayPalHttpClient(environment);
} catch (error) {
  console.log('⚠️  PayPal not configured');
}

/**
 * Create PayPal order
 * @param {string} orderId - MongoDB Order ID
 * @returns {Promise<Object>} - PayPal order
 */
exports.createPayPalOrder = async (orderId) => {
  try {
    if (!paypalClient) {
      throw new Error('PayPal not configured');
    }

    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new Error('Order not found');
    }

    // Create PayPal order request
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: orderId,
        description: `Order ${order.orderNumber}`,
        custom_id: orderId,
        amount: {
          currency_code: order.currency,
          value: order.total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: order.currency,
              value: order.subtotal.toFixed(2)
            },
            tax_total: {
              currency_code: order.currency,
              value: order.tax.toFixed(2)
            }
          }
        },
        items: order.items.map(item => ({
          name: item.productName,
          description: item.product?.shortDescription?.substring(0, 127) || '',
          unit_amount: {
            currency_code: order.currency,
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString(),
          category: 'DIGITAL_GOODS'
        }))
      }],
      application_context: {
        brand_name: 'Hypnotherapist.ie',
        landing_page: 'NO_PREFERENCE',
        user_action: 'PAY_NOW',
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        cancel_url: `${process.env.CLIENT_URL}/payment/cancel`
      }
    });

    const response = await paypalClient.execute(request);

    return response.result;
  } catch (error) {
    console.error('Error creating PayPal order:', error);
    throw error;
  }
};

/**
 * Capture PayPal order
 * @param {string} paypalOrderId - PayPal order ID
 * @returns {Promise<Object>} - Capture result
 */
exports.capturePayPalOrder = async (paypalOrderId) => {
  try {
    if (!paypalClient) {
      throw new Error('PayPal not configured');
    }

    const request = new paypal.orders.OrdersCaptureRequest(paypalOrderId);
    request.requestBody({});

    const response = await paypalClient.execute(request);

    return response.result;
  } catch (error) {
    console.error('Error capturing PayPal order:', error);
    throw error;
  }
};

/**
 * Handle successful PayPal payment
 * @param {Object} captureData - PayPal capture data
 * @returns {Promise<Object>} - Updated order
 */
exports.handlePaymentSuccess = async (captureData) => {
  try {
    // Get order ID from custom_id or reference_id
    const orderId = captureData.purchase_units[0]?.custom_id || 
                    captureData.purchase_units[0]?.reference_id;

    if (!orderId) {
      throw new Error('Order ID not found in PayPal capture data');
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
      paypalOrderId: captureData.id,
      transactionId: captureData.purchase_units[0]?.payments?.captures[0]?.id,
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

    return order;
  } catch (error) {
    console.error('Error handling PayPal payment success:', error);
    throw error;
  }
};

/**
 * Verify PayPal webhook signature
 * @param {Object} headers - Request headers
 * @param {Object} body - Request body
 * @returns {Promise<boolean>} - Verification result
 */
exports.verifyWebhook = async (headers, body) => {
  try {
    if (!paypalClient) {
      throw new Error('PayPal not configured');
    }

    // PayPal webhook verification
    // Note: This is a simplified version. In production, implement full verification
    // https://developer.paypal.com/docs/api-basics/notifications/webhooks/notification-messages/#link-verifywebhooksignature

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    
    if (!webhookId) {
      console.warn('PayPal webhook ID not configured, skipping verification');
      return true; // Allow in development
    }

    // TODO: Implement full PayPal webhook verification
    // This requires additional setup and the webhook ID from PayPal dashboard

    return true;
  } catch (error) {
    console.error('Error verifying PayPal webhook:', error);
    return false;
  }
};

/**
 * Create refund
 * @param {string} captureId - PayPal capture ID
 * @param {number} amount - Amount to refund (optional)
 * @returns {Promise<Object>} - Refund result
 */
exports.createRefund = async (captureId, amount = null) => {
  try {
    if (!paypalClient) {
      throw new Error('PayPal not configured');
    }

    const request = new paypal.payments.CapturesRefundRequest(captureId);
    
    if (amount) {
      request.requestBody({
        amount: {
          currency_code: 'EUR',
          value: amount.toFixed(2)
        }
      });
    } else {
      request.requestBody({});
    }

    const response = await paypalClient.execute(request);

    return response.result;
  } catch (error) {
    console.error('Error creating PayPal refund:', error);
    throw error;
  }
};

/**
 * Check if PayPal is configured
 * @returns {boolean}
 */
exports.isConfigured = () => {
  return !!(paypalClient && process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
};

module.exports.paypalClient = paypalClient;

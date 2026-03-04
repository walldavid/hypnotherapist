const orders = require('../collections/orders');
const products = require('../collections/products');
const users = require('../collections/users');

// Create order
exports.createOrder = async (req, res, next) => {
  try {
    const { customerEmail, customerName, items, paymentMethod } = req.body;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await products.getById(item.product);
      if (!product || product.status !== 'active') {
        return res.status(400).json({ error: `Product ${item.product} not found or inactive` });
      }
      orderItems.push({
        product: product.id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity || 1,
      });
      subtotal += product.price * (item.quantity || 1);
    }

    const tax = 0;
    const total = subtotal + tax;

    const order = await orders.create({
      customerEmail,
      customerName,
      items: orderItems,
      subtotal,
      tax,
      total,
      paymentMethod,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    await users.createOrUpdate(customerEmail, customerName, order.id, orderItems, 0);

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, paymentStatus, limit = 50, page = 1 } = req.query;
    const result = await orders.list({ status, paymentStatus, page, limit });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

// Get order by ID (admin)
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await orders.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Enrich items with product info
    for (const item of order.items || []) {
      if (item.product) {
        const product = await products.getById(item.product);
        if (product) {
          item.productData = { id: product.id, name: product.name, price: product.price, category: product.category };
        }
      }
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Get order by order number (public, for customer)
exports.getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;
    const { email } = req.query;

    const order = await orders.findByOrderNumber(orderNumber);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (email && order.customerEmail !== email.toLowerCase()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// Update order status (admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await orders.getById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const updated = await orders.update(req.params.id, updateData);
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// Generate download tokens after successful payment (called by payment services)
exports.generateDownloadTokens = async (orderId) => {
  const order = await orders.getById(orderId);
  if (!order) throw new Error('Order not found');

  const productsMap = {};
  for (const item of order.items || []) {
    if (item.product) {
      const product = await products.getById(item.product);
      if (product) productsMap[item.product] = product;
    }
  }

  return orders.generateDownloadTokens(orderId, order.items || [], productsMap);
};

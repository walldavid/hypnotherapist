const db = require('../lib/db');
const crypto = require('crypto');

const COLLECTION = 'orders';
const TOKENS_COLLECTION = 'downloadTokens';
const col = () => db.collection(COLLECTION);
const tokensCol = () => db.collection(TOKENS_COLLECTION);

function generateOrderNumber() {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `HT${yy}${mm}${dd}${rand}`;
}

async function create(data) {
  const now = new Date().toISOString();
  const order = {
    orderNumber: generateOrderNumber(),
    customerEmail: (data.customerEmail || '').toLowerCase(),
    customerName: data.customerName || '',
    items: data.items || [],
    subtotal: data.subtotal || 0,
    tax: data.tax || 0,
    total: data.total || 0,
    currency: data.currency || 'EUR',
    paymentMethod: data.paymentMethod || 'stripe',
    paymentStatus: 'pending',
    status: 'pending',
    paymentDetails: {},
    downloads: [],
    ipAddress: data.ipAddress || '',
    userAgent: data.userAgent || '',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col().add(order);
  return { id: ref.id, ...order };
}

async function getById(id) {
  const doc = await col().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function findByOrderNumber(orderNumber, customerEmail = null) {
  let q = col().where('orderNumber', '==', orderNumber);
  if (customerEmail) q = q.where('customerEmail', '==', customerEmail.toLowerCase());
  const snap = await q.limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function findByStripePaymentIntent(paymentIntentId) {
  const snap = await col()
    .where('paymentDetails.stripePaymentIntentId', '==', paymentIntentId)
    .limit(1)
    .get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function list({ status, paymentStatus, page = 1, limit = 50 } = {}) {
  let q = col().orderBy('createdAt', 'desc');
  // Firestore requires a composite index for filtering + ordering; fall back to client-side if needed
  const snap = await q.get();
  let all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  if (status) all = all.filter(o => o.status === status);
  if (paymentStatus) all = all.filter(o => o.paymentStatus === paymentStatus);
  const total = all.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  return {
    orders: all.slice(start, start + parseInt(limit)),
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
  };
}

async function update(id, data) {
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await col().doc(id).update(updated);
  return getById(id);
}

async function countDocuments(query = {}) {
  let q = col();
  for (const [key, value] of Object.entries(query)) {
    q = q.where(key, '==', value);
  }
  const snap = await q.count().get();
  return snap.data().count;
}

async function getTotalRevenue() {
  const snap = await col().where('paymentStatus', '==', 'completed').get();
  return snap.docs.reduce((sum, doc) => sum + (doc.data().total || 0), 0);
}

async function getRecentOrders(limit = 10) {
  const snap = await col().orderBy('createdAt', 'desc').limit(limit).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Download token management

async function generateDownloadTokens(orderId, items, productsMap) {
  const tokens = [];

  for (const item of items) {
    const product = productsMap[item.product];
    if (!product || !product.files || product.files.length === 0) continue;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (product.downloadExpiry || 48));

    tokens.push({
      token,
      product: item.product,
      productName: item.productName,
      downloadCount: 0,
      maxDownloads: product.maxDownloads || 5,
      expiresAt: expiresAt.toISOString(),
    });
  }

  if (tokens.length === 0) return [];

  const batch = db.batch();

  // Store token list in the order
  batch.update(col().doc(orderId), {
    downloads: tokens,
    updatedAt: new Date().toISOString(),
  });

  // Store each token as a separate document for fast lookup
  for (const t of tokens) {
    batch.set(tokensCol().doc(t.token), {
      orderId,
      productId: t.product,
      maxDownloads: t.maxDownloads,
      downloadCount: 0,
      lastDownloadedAt: null,
      expiresAt: t.expiresAt,
      createdAt: new Date().toISOString(),
    });
  }

  await batch.commit();
  return tokens;
}

async function getDownloadToken(token) {
  const doc = await tokensCol().doc(token).get();
  if (!doc.exists) return null;
  return { token: doc.id, ...doc.data() };
}

async function updateDownloadToken(token, data) {
  await tokensCol().doc(token).update({ ...data, updatedAt: new Date().toISOString() });
}

module.exports = {
  create,
  getById,
  findByOrderNumber,
  findByStripePaymentIntent,
  list,
  update,
  countDocuments,
  getTotalRevenue,
  getRecentOrders,
  generateDownloadTokens,
  getDownloadToken,
  updateDownloadToken,
};

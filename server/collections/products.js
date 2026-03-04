const db = require('../lib/db');

const COLLECTION = 'products';
const col = () => db.collection(COLLECTION);

const VALID_CATEGORIES = ['audio', 'course', 'pdf', 'video', 'bundle'];
const VALID_STATUSES = ['active', 'inactive', 'draft'];

function validate(data, requireName = true) {
  const errors = [];
  if (requireName && (!data.name || !String(data.name).trim())) errors.push('Name is required');
  if (data.price !== undefined && (isNaN(data.price) || data.price < 0)) errors.push('Price must be a non-negative number');
  if (data.category && !VALID_CATEGORIES.includes(data.category)) errors.push(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`);
  if (data.status && !VALID_STATUSES.includes(data.status)) errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
  if (errors.length) {
    const err = new Error(errors.join(', '));
    err.statusCode = 400;
    throw err;
  }
}

async function list({ status, category, page = 1, limit = 20, sort = 'desc' } = {}) {
  let q = col();
  if (status) q = q.where('status', '==', status);
  if (category) q = q.where('category', '==', category);
  q = q.orderBy('createdAt', sort === 'asc' ? 'asc' : 'desc');

  const snap = await q.get();
  const all = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const total = all.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  return {
    products: all.slice(start, start + parseInt(limit)),
    pagination: { total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) }
  };
}

async function search(query) {
  const snap = await col().where('status', '==', 'active').get();
  const q = query.toLowerCase();
  return snap.docs
    .map(doc => ({ id: doc.id, ...doc.data() }))
    .filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
}

async function getById(id) {
  const doc = await col().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create(data) {
  validate(data);
  const now = new Date().toISOString();
  const product = {
    name: data.name,
    description: data.description || '',
    shortDescription: data.shortDescription || '',
    price: parseFloat(data.price) || 0,
    currency: data.currency || 'EUR',
    category: data.category,
    status: data.status || 'draft',
    features: data.features || [],
    tags: data.tags || [],
    files: data.files || [],
    images: data.images || [],
    ratings: { average: 0, count: 0 },
    salesCount: 0,
    downloadExpiry: data.downloadExpiry || 48,
    maxDownloads: data.maxDownloads || 5,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col().add(product);
  return { id: ref.id, ...product };
}

async function update(id, data) {
  validate(data, false);
  const ref = col().doc(id);
  const doc = await ref.get();
  if (!doc.exists) return null;
  const updated = { ...data, updatedAt: new Date().toISOString() };
  await ref.update(updated);
  return { id, ...doc.data(), ...updated };
}

async function remove(id) {
  await col().doc(id).delete();
}

async function incrementSalesCount(id, qty = 1) {
  const doc = await col().doc(id).get();
  if (!doc.exists) return;
  const current = doc.data().salesCount || 0;
  await col().doc(id).update({ salesCount: current + qty, updatedAt: new Date().toISOString() });
}

async function countDocuments(query = {}) {
  let q = col();
  for (const [key, value] of Object.entries(query)) {
    q = q.where(key, '==', value);
  }
  const snap = await q.count().get();
  return snap.data().count;
}

async function getTopBySales(limit = 5) {
  const snap = await col().where('status', '==', 'active').orderBy('salesCount', 'desc').limit(limit).get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

module.exports = { list, search, getById, create, update, remove, incrementSalesCount, countDocuments, getTopBySales };

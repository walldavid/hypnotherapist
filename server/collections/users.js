const db = require('../lib/db');

const COLLECTION = 'users';
// Use email as the document ID so lookups are O(1)
const col = () => db.collection(COLLECTION);

function key(email) {
  return email.toLowerCase().replace(/\./g, '_dot_');
}

async function getByEmail(email) {
  const doc = await col().doc(key(email)).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function createOrUpdate(email, name, orderId, orderItems, orderTotal) {
  const docKey = key(email);
  const ref = col().doc(docKey);
  const existing = await ref.get();
  const now = new Date().toISOString();

  const purchase = {
    orderId,
    products: orderItems.map(i => i.product),
    purchasedAt: now,
  };

  if (!existing.exists) {
    await ref.set({
      email: email.toLowerCase(),
      name: name || '',
      purchases: [purchase],
      totalSpent: orderTotal || 0,
      orderCount: 1,
      preferences: { newsletter: false, notifications: true },
      status: 'active',
      createdAt: now,
      updatedAt: now,
    });
  } else {
    const data = existing.data();
    await ref.update({
      name: name || data.name,
      purchases: [...(data.purchases || []), purchase],
      totalSpent: (data.totalSpent || 0) + (orderTotal || 0),
      orderCount: (data.orderCount || 0) + 1,
      updatedAt: now,
    });
  }
}

async function incrementTotalSpent(email, amount) {
  const docKey = key(email);
  const ref = col().doc(docKey);
  const doc = await ref.get();
  if (!doc.exists) return;
  await ref.update({
    totalSpent: (doc.data().totalSpent || 0) + amount,
    updatedAt: new Date().toISOString(),
  });
}

async function countDocuments() {
  const snap = await col().count().get();
  return snap.data().count;
}

module.exports = { getByEmail, createOrUpdate, incrementTotalSpent, countDocuments };

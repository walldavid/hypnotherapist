const db = require('../lib/db');
const bcrypt = require('bcrypt');

const COLLECTION = 'admins';
const col = () => db.collection(COLLECTION);
const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours
const MAX_ATTEMPTS = 5;

async function findByUsername(username) {
  const snap = await col().where('username', '==', username).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function findByEmail(email) {
  const snap = await col().where('email', '==', email.toLowerCase()).limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function getById(id) {
  const doc = await col().doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function create({ username, email, password, name = '', role = 'admin' }) {
  if (await findByUsername(username)) {
    const err = new Error('Username already exists'); err.statusCode = 400; throw err;
  }
  if (await findByEmail(email)) {
    const err = new Error('Email already exists'); err.statusCode = 400; throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();
  const admin = {
    username,
    email: email.toLowerCase(),
    password: hash,
    name,
    role,
    status: 'active',
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: null,
    createdAt: now,
    updatedAt: now,
  };
  const ref = await col().add(admin);
  return { id: ref.id, ...admin };
}

async function comparePassword(admin, plainPassword) {
  return bcrypt.compare(plainPassword, admin.password);
}

function isLocked(admin) {
  return !!(admin.lockUntil && admin.lockUntil > Date.now());
}

async function incrementLoginAttempts(id) {
  const admin = await getById(id);
  const attempts = (admin.loginAttempts || 0) + 1;
  const update = { loginAttempts: attempts, updatedAt: new Date().toISOString() };
  if (attempts >= MAX_ATTEMPTS) {
    update.lockUntil = Date.now() + LOCK_DURATION_MS;
  }
  await col().doc(id).update(update);
}

async function resetLoginAttempts(id) {
  await col().doc(id).update({
    loginAttempts: 0,
    lockUntil: null,
    lastLogin: Date.now(),
    updatedAt: new Date().toISOString(),
  });
}

async function update(id, data) {
  await col().doc(id).update({ ...data, updatedAt: new Date().toISOString() });
}

async function countDocuments() {
  const snap = await col().count().get();
  return snap.data().count;
}

module.exports = {
  findByUsername,
  findByEmail,
  getById,
  create,
  comparePassword,
  isLocked,
  incrementLoginAttempts,
  resetLoginAttempts,
  update,
  countDocuments,
};

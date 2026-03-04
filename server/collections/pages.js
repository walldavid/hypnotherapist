const db = require('../lib/db');

const COLLECTION = 'pages';
// Use slug as the document ID for direct lookups
const col = () => db.collection(COLLECTION);

async function getBySlug(slug) {
  const doc = await col().doc(slug).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

async function list(statusFilter = 'published') {
  let q = col();
  if (statusFilter) q = q.where('status', '==', statusFilter);
  const snap = await q.get();
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function create(data, adminId) {
  const ref = col().doc(data.slug);
  const existing = await ref.get();
  if (existing.exists) {
    const err = new Error('A page with this slug already exists'); err.statusCode = 400; throw err;
  }
  const now = new Date().toISOString();
  const page = {
    slug: data.slug,
    title: data.title || '',
    metaDescription: data.metaDescription || '',
    sections: data.sections || [],
    status: data.status || 'draft',
    modifiedBy: adminId || null,
    lastModified: now,
    createdAt: now,
    updatedAt: now,
  };
  await ref.set(page);
  return { id: data.slug, ...page };
}

async function update(slug, data, adminId) {
  const ref = col().doc(slug);
  const existing = await ref.get();
  if (!existing.exists) return null;
  const now = new Date().toISOString();
  const updated = { ...data, modifiedBy: adminId || null, lastModified: now, updatedAt: now };
  await ref.update(updated);
  return { id: slug, ...existing.data(), ...updated };
}

async function updateSection(slug, sectionId, content, adminId) {
  const page = await getBySlug(slug);
  if (!page) return null;

  const sections = (page.sections || []).map(s =>
    s.id === sectionId ? { ...s, content } : s
  );

  const foundSection = (page.sections || []).find(s => s.id === sectionId);
  if (!foundSection) {
    const err = new Error('Section not found'); err.statusCode = 404; throw err;
  }

  const now = new Date().toISOString();
  await col().doc(slug).update({
    sections,
    modifiedBy: adminId || null,
    lastModified: now,
    updatedAt: now,
  });
  return { id: slug, ...page, sections };
}

async function remove(slug) {
  await col().doc(slug).delete();
}

module.exports = { getBySlug, list, create, update, updateSection, remove };

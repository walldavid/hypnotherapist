const { Firestore } = require('@google-cloud/firestore');

// When FIRESTORE_EMULATOR_HOST is set, the SDK connects to the local emulator automatically.
// On Cloud Run, Application Default Credentials are used — no key file needed.
const db = new Firestore({
  projectId: process.env.FIRESTORE_PROJECT_ID,
});

module.exports = db;

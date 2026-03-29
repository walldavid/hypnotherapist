import * as admin from 'firebase-admin'

function initFirebase() {
  if (admin.apps.length) return

  let credential: admin.credential.Credential

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
  if (raw && raw.startsWith('{')) {
    try {
      const serviceAccount = JSON.parse(raw)
      credential = admin.credential.cert(serviceAccount)
    } catch {
      credential = admin.credential.applicationDefault()
    }
  } else {
    credential = admin.credential.applicationDefault()
  }

  admin.initializeApp({
    credential,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  })
}

initFirebase()

export const db = admin.firestore()
export default admin

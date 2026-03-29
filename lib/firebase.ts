import { Firestore } from '@google-cloud/firestore'

function createDb(): Firestore {
  if (process.env.NODE_ENV === 'development' && process.env.USE_EMULATOR === 'true') {
    console.log('[Firestore] Using emulator at localhost:8081')
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8081'
    return new Firestore({
      projectId: 'hypno-local-dev',
      databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
    })
  }

  console.log('[Firestore] Using production (ADC)')
  return new Firestore({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)',
  })
}

export const db = createDb()

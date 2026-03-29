/**
 * Token storage backed by Firebase Firestore.
 * Collections:
 *   downloadTokens/{token}  — download token data
 *   sessionTokens/{sessionId} — stripe session → token mapping
 *
 * TTL: configure a Firestore TTL policy on the `expireAt` field in each collection
 * via the GCP Console → Firestore → Indexes → TTL policies.
 */
import { db } from './firebase'

interface DownloadTokenData {
  audioKey: string
  expiry: number
  used?: boolean
}

export async function storeDownloadToken(
  token: string,
  data: { audioKey: string; expiry: number }
): Promise<void> {
  await db.collection('downloadTokens').doc(token).set({
    audioKey: data.audioKey,
    expiry: data.expiry,
    used: false,
    createdAt: Date.now(),
    expireAt: new Date(data.expiry), // used by Firestore TTL policy
  })
}

export async function getDownloadToken(
  token: string
): Promise<DownloadTokenData | null> {
  const doc = await db.collection('downloadTokens').doc(token).get()
  if (!doc.exists) return null
  return doc.data() as DownloadTokenData | null
}

export async function markTokenUsed(token: string): Promise<void> {
  await db.collection('downloadTokens').doc(token).update({ used: true })
}

export async function storeSessionToken(
  sessionId: string,
  token: string
): Promise<void> {
  await db.collection('sessionTokens').doc(sessionId).set({
    token,
    createdAt: Date.now(),
    expireAt: new Date(Date.now() + 86400 * 1000), // used by Firestore TTL policy
  })
}

export async function getTokenBySession(
  sessionId: string
): Promise<string | null> {
  const doc = await db.collection('sessionTokens').doc(sessionId).get()
  if (!doc.exists) return null
  return (doc.data() as { token: string }).token
}

/**
 * Audio file storage backed by Google Cloud Storage.
 * Replaces the original AWS S3 implementation.
 *
 * Bucket should be private (uniform access control, no public access).
 * The service account needs roles/storage.objectViewer on the bucket.
 */
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // In Cloud Run, Application Default Credentials are used automatically.
  // Locally, set GOOGLE_APPLICATION_CREDENTIALS to your service account key path,
  // or set GCS_SERVICE_ACCOUNT_JSON with the JSON string.
  ...(process.env.GCS_SERVICE_ACCOUNT_JSON
    ? { credentials: JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON) }
    : {}),
})

export async function generatePresignedDownloadUrl(
  key: string,
  expiresInSeconds = 60
): Promise<string> {
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)
  const file = bucket.file(key)

  const [url] = await file.getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInSeconds * 1000,
  })

  return url
}

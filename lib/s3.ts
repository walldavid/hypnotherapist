/**
 * Audio file storage backed by Google Cloud Storage.
 *
 * Production: uses Application Default Credentials automatically (Cloud Run service account).
 * Local dev:  set GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json
 *             (download a service account key from GCP Console → IAM → Service Accounts)
 *
 * The service account needs roles/storage.objectViewer on the bucket.
 * Bucket must have uniform access control with no public access.
 */
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
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

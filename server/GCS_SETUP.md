# Google Cloud Storage Setup Guide

## Prerequisites

1. Google Cloud Platform account
2. A GCP project created
3. Billing enabled on the project

## Setup Steps

### 1. Create a Storage Bucket

```bash
# Install Google Cloud SDK if not already installed
# Visit: https://cloud.google.com/sdk/docs/install

# Login to GCP
gcloud auth login

# Set your project
gcloud config set project YOUR_PROJECT_ID

# Create a bucket (choose a unique name)
gsutil mb -l europe-west1 gs://hypnotherapist-products

# Set bucket permissions (optional - for public access)
gsutil iam ch allUsers:objectViewer gs://hypnotherapist-products
```

### 2. Create a Service Account

1. Go to [GCP Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **Create Service Account**
4. Name: `hypnotherapist-storage`
5. Grant role: **Storage Object Admin**
6. Click **Done**

### 3. Generate Service Account Key

1. Click on the service account you just created
2. Go to **Keys** tab
3. Click **Add Key** > **Create New Key**
4. Choose **JSON** format
5. Download the key file
6. Save it as `gcp-service-account-key.json` in the `server/config/` directory

**IMPORTANT:** Never commit this key file to Git! It's already in .gitignore

### 4. Update Environment Variables

Edit `server/.env`:

```bash
# Google Cloud Storage
GCS_PROJECT_ID=your-gcp-project-id
GCS_BUCKET_NAME=hypnotherapist-products
GCS_KEY_FILE=./config/gcp-service-account-key.json
```

### 5. Test the Setup

Start the server and try uploading a file through the admin API:

```bash
cd server
npm run dev
```

Use the admin upload endpoint:
```
POST /api/admin/products/:productId/upload
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: multipart/form-data

files: [your files]
```

## Security Best Practices

1. **Never commit service account keys to Git**
2. Use IAM roles with minimum required permissions
3. Enable bucket versioning for backup:
   ```bash
   gsutil versioning set on gs://hypnotherapist-products
   ```
4. Set up lifecycle policies to auto-delete old files:
   ```bash
   gsutil lifecycle set lifecycle.json gs://hypnotherapist-products
   ```
5. Enable audit logging
6. Use signed URLs for temporary access (already implemented)

## Production Deployment

For production on Google Cloud Platform:

1. **Use Workload Identity** instead of service account keys
2. **Enable Cloud CDN** for faster downloads
3. **Set up Cloud Monitoring** for bucket metrics
4. **Configure CORS** if needed:

```bash
gsutil cors set cors.json gs://hypnotherapist-products
```

Example `cors.json`:
```json
[
  {
    "origin": ["https://hypnotherapist.ie"],
    "method": ["GET", "HEAD"],
    "responseHeader": ["Content-Type"],
    "maxAgeSeconds": 3600
  }
]
```

## Troubleshooting

### Error: "Application Default Credentials not found"
- Make sure `GCS_KEY_FILE` path is correct in `.env`
- Verify the service account key file exists

### Error: "Permission denied"
- Check service account has **Storage Object Admin** role
- Verify bucket name is correct

### Files not uploading
- Check file size limits (currently 500MB per file)
- Verify file types are allowed (see `middleware/upload.js`)
- Check server logs for detailed error messages

## Cost Optimization

- Use lifecycle policies to auto-delete old files
- Consider using **Nearline** or **Coldline** storage for archival
- Monitor bandwidth usage
- Set up budget alerts in GCP Console

## Useful Commands

```bash
# List all files in bucket
gsutil ls gs://hypnotherapist-products/

# Get bucket info
gsutil du -s gs://hypnotherapist-products/

# Copy files locally for backup
gsutil cp -r gs://hypnotherapist-products/ ./backup/

# Delete specific file
gsutil rm gs://hypnotherapist-products/products/filename.pdf

# Make bucket private (recommended)
gsutil iam ch -d allUsers:objectViewer gs://hypnotherapist-products
```

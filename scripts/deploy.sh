#!/bin/bash
# Deploy to Google Cloud Run
# Usage: bash scripts/deploy.sh
#
# Prerequisites:
#   - gcloud CLI installed and authenticated (gcloud auth login)
#   - gcloud CLI configured with your project (gcloud config set project YOUR_PROJECT_ID)
#   - Cloud Run API enabled
#   - Firestore API enabled
#   - Container Registry or Artifact Registry enabled
#
# Required environment variable:
#   GCP_PROJECT_ID  — your GCP project ID
#
# Sensitive env vars (set them in Cloud Run after first deploy, or pass via --set-env-vars):
#   JWT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, etc.

set -e

PROJECT_ID="${GCP_PROJECT_ID:?GCP_PROJECT_ID is not set. Export it first: export GCP_PROJECT_ID=your-project-id}"
SERVICE="hypnotherapist"
REGION="europe-west1"
IMAGE="gcr.io/${PROJECT_ID}/${SERVICE}"

echo "============================================"
echo " Deploying ${SERVICE} to Cloud Run"
echo " Project:  ${PROJECT_ID}"
echo " Region:   ${REGION}"
echo " Image:    ${IMAGE}"
echo "============================================"

echo ""
echo "→ Building image and pushing to Container Registry..."
gcloud builds submit --tag "${IMAGE}" .

echo ""
echo "→ Deploying to Cloud Run..."
gcloud run deploy "${SERVICE}" \
  --image "${IMAGE}" \
  --region "${REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,FIRESTORE_PROJECT_ID=${PROJECT_ID}"

echo ""
echo "→ Fetching service URL..."
SERVICE_URL=$(gcloud run services describe "${SERVICE}" \
  --region "${REGION}" \
  --format "value(status.url)")

echo ""
echo "============================================"
echo " Deployment complete!"
echo " URL: ${SERVICE_URL}"
echo "============================================"
echo ""
echo "Next steps:"
echo "  1. Set remaining environment variables in Cloud Run:"
echo "     gcloud run services update ${SERVICE} --region ${REGION} \\"
echo "       --set-env-vars JWT_SECRET=...,STRIPE_SECRET_KEY=...,..."
echo ""
echo "  2. Update CLIENT_URL to your Cloud Run URL:"
echo "     gcloud run services update ${SERVICE} --region ${REGION} \\"
echo "       --set-env-vars CLIENT_URL=${SERVICE_URL}"
echo ""
echo "  3. Point your custom domain (hypnotherapist.ie) to Cloud Run:"
echo "     gcloud run domain-mappings create --service ${SERVICE} \\"
echo "       --domain hypnotherapist.ie --region ${REGION}"

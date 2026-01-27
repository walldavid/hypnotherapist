const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Initialize Google Cloud Storage
let storage;
let bucket;

try {
  // Check if running in GCP environment or with service account key
  if (process.env.GCS_KEY_FILE && require('fs').existsSync(process.env.GCS_KEY_FILE)) {
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      keyFilename: process.env.GCS_KEY_FILE
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Using default credentials
    storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID
    });
  } else {
    console.log('⚠️  Google Cloud Storage not configured - file operations will be disabled');
  }

  if (storage && process.env.GCS_BUCKET_NAME) {
    bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  }
} catch (error) {
  console.error('Error initializing Google Cloud Storage:', error.message);
}

/**
 * Upload file to Google Cloud Storage
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} filename - Original filename
 * @param {string} mimetype - File MIME type
 * @returns {Promise<Object>} - File metadata
 */
exports.uploadFile = async (fileBuffer, filename, mimetype) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured');
  }

  try {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(filename);
    const baseName = path.basename(filename, ext);
    const uniqueFilename = `${baseName}-${timestamp}${ext}`;
    const blobName = `products/${uniqueFilename}`;

    const blob = bucket.file(blobName);
    const blobStream = blob.createWriteStream({
      resumable: false,
      metadata: {
        contentType: mimetype,
        metadata: {
          originalName: filename
        }
      }
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (err) => {
        reject(err);
      });

      blobStream.on('finish', async () => {
        // Make file publicly readable (optional - depends on security requirements)
        // await blob.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blobName}`;

        resolve({
          filename: uniqueFilename,
          originalName: filename,
          gcsUrl: blobName, // Store the blob name, not public URL
          publicUrl, // Optional public URL
          fileSize: fileBuffer.length,
          mimeType: mimetype,
          uploadedAt: new Date()
        });
      });

      blobStream.end(fileBuffer);
    });
  } catch (error) {
    console.error('Error uploading file to GCS:', error);
    throw error;
  }
};

/**
 * Generate signed URL for file download
 * @param {string} gcsUrl - GCS blob name
 * @param {number} expiresIn - Expiration time in hours (default: 48)
 * @returns {Promise<string>} - Signed URL
 */
exports.getSignedUrl = async (gcsUrl, expiresIn = 48) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured');
  }

  try {
    const file = bucket.file(gcsUrl);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + expiresIn * 60 * 60 * 1000 // Convert hours to milliseconds
    });

    return url;
  } catch (error) {
    console.error('Error generating signed URL:', error);
    throw error;
  }
};

/**
 * Delete file from Google Cloud Storage
 * @param {string} gcsUrl - GCS blob name
 * @returns {Promise<void>}
 */
exports.deleteFile = async (gcsUrl) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured');
  }

  try {
    const file = bucket.file(gcsUrl);
    await file.delete();
    console.log(`File ${gcsUrl} deleted successfully`);
  } catch (error) {
    if (error.code === 404) {
      console.log(`File ${gcsUrl} not found in GCS`);
    } else {
      console.error('Error deleting file from GCS:', error);
      throw error;
    }
  }
};

/**
 * Delete multiple files from Google Cloud Storage
 * @param {Array<string>} gcsUrls - Array of GCS blob names
 * @returns {Promise<void>}
 */
exports.deleteFiles = async (gcsUrls) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured');
  }

  try {
    const deletePromises = gcsUrls.map(url => this.deleteFile(url));
    await Promise.all(deletePromises);
    console.log(`${gcsUrls.length} files deleted successfully`);
  } catch (error) {
    console.error('Error deleting files from GCS:', error);
    throw error;
  }
};

/**
 * Check if file exists in Google Cloud Storage
 * @param {string} gcsUrl - GCS blob name
 * @returns {Promise<boolean>}
 */
exports.fileExists = async (gcsUrl) => {
  if (!bucket) {
    return false;
  }

  try {
    const file = bucket.file(gcsUrl);
    const [exists] = await file.exists();
    return exists;
  } catch (error) {
    console.error('Error checking file existence:', error);
    return false;
  }
};

/**
 * Get file metadata
 * @param {string} gcsUrl - GCS blob name
 * @returns {Promise<Object>}
 */
exports.getFileMetadata = async (gcsUrl) => {
  if (!bucket) {
    throw new Error('Google Cloud Storage not configured');
  }

  try {
    const file = bucket.file(gcsUrl);
    const [metadata] = await file.getMetadata();
    return metadata;
  } catch (error) {
    console.error('Error getting file metadata:', error);
    throw error;
  }
};

module.exports.isConfigured = () => {
  return !!(storage && bucket);
};

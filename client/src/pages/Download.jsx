import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import './Download.css';

function Download() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(true);
  const [downloadData, setDownloadData] = useState(null);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState({});

  useEffect(() => {
    if (token) {
      validateToken();
    } else {
      setError('No download token provided');
      setLoading(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/downloads/${token}`);
      setDownloadData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error validating token:', error);
      setError(error.response?.data?.error || 'Invalid or expired download link');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fileIndex) => {
    try {
      setDownloading(prev => ({ ...prev, [fileIndex]: true }));
      
      const response = await api.post(`/downloads/${token}/file`, { fileIndex });
      const { signedUrl, filename } = response.data;

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = signedUrl;
      link.download = filename || 'download';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download started');
      
      // Refresh download data to update download count
      await validateToken();
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error(error.response?.data?.error || 'Failed to download file');
    } finally {
      setDownloading(prev => ({ ...prev, [fileIndex]: false }));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date();
  };

  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry - now;

    if (diff < 0) return 'Expired';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    } else {
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="download-page">
        <div className="download-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>Validating your download link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="download-page">
        <div className="download-container">
          <div className="error-state">
            <div className="error-icon">❌</div>
            <h2>Access Denied</h2>
            <p>{error}</p>
            <div className="error-reasons">
              <h3>This could be because:</h3>
              <ul>
                <li>The download link has expired</li>
                <li>You've reached the maximum number of downloads</li>
                <li>The link is invalid or has been revoked</li>
              </ul>
            </div>
            <Link to="/products" className="btn btn-primary">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const expired = isExpired(downloadData.expiresAt);
  const downloadsRemaining = downloadData.maxDownloads - downloadData.downloadCount;

  return (
    <div className="download-page">
      <div className="download-container">
        <div className="download-header">
          <div className="success-icon">✓</div>
          <h1>Your Downloads</h1>
          <p>Thank you for your purchase!</p>
        </div>

        <div className="product-info">
          <h2>{downloadData.productName}</h2>
          <div className="order-meta">
            <span>Order: {downloadData.orderNumber}</span>
            <span>•</span>
            <span>{downloadData.customerEmail}</span>
          </div>
        </div>

        <div className="download-status">
          <div className="status-item">
            <span className="status-label">Downloads Used:</span>
            <span className="status-value">
              {downloadData.downloadCount} of {downloadData.maxDownloads}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Time Remaining:</span>
            <span className={`status-value ${expired ? 'expired' : ''}`}>
              {getTimeRemaining(downloadData.expiresAt)}
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Expires:</span>
            <span className="status-value">{formatDate(downloadData.expiresAt)}</span>
          </div>
        </div>

        {expired ? (
          <div className="expired-notice">
            <p>⚠️ This download link has expired. Please contact support if you need assistance.</p>
          </div>
        ) : downloadsRemaining <= 0 ? (
          <div className="expired-notice">
            <p>⚠️ You have used all available downloads for this product.</p>
          </div>
        ) : (
          <>
            <div className="files-list">
              <h3>Available Files ({downloadData.files.length})</h3>
              {downloadData.files.map((file, index) => (
                <div key={index} className="file-item">
                  <div className="file-info">
                    <div className="file-icon">📄</div>
                    <div className="file-details">
                      <span className="file-name">{file.originalName || `File ${index + 1}`}</span>
                      {file.size && (
                        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(index)}
                    disabled={downloading[index]}
                    className="btn btn-primary btn-download"
                  >
                    {downloading[index] ? (
                      <>
                        <span className="spinner-small"></span>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <span>⬇</span>
                        Download
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {downloadsRemaining <= 2 && (
              <div className="warning-notice">
                <p>⚠️ You have {downloadsRemaining} download{downloadsRemaining !== 1 ? 's' : ''} remaining.</p>
              </div>
            )}
          </>
        )}

        <div className="download-tips">
          <h3>Download Tips</h3>
          <ul>
            <li>Save files to your device immediately after downloading</li>
            <li>Make backup copies of important files</li>
            <li>Download links expire after {downloadData.maxDownloads} downloads or on {formatDate(downloadData.expiresAt)}</li>
            <li>Contact support if you experience any issues</li>
          </ul>
        </div>

        <div className="download-footer">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
      </div>
    </div>
  );
}

export default Download;

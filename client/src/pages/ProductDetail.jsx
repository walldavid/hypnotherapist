import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const CATEGORY_ICONS = {
  audio: '🎧',
  course: '📚',
  pdf: '📄',
  video: '🎥',
  bundle: '📦'
};

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const response = await getProductById(id);
      setProduct(response.data);
    } catch (error) {
      console.error('Error loading product:', error);
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success('Added to cart!');
    navigate('/cart');
  };

  if (loading) {
    return <div className="loading">Loading program details...</div>;
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Program Not Found</h2>
        <p>Sorry, we couldn't find the program you're looking for.</p>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Browse All Programs
        </button>
      </div>
    );
  }

  return (
    <div className="product-detail">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back
        </button>

        <div className="product-content">
          {/* Product Image */}
          <div className="product-image-large">
            {product.images && product.images[0] ? (
              <img src={product.images[0].url} alt={product.name} />
            ) : (
              <div className="product-placeholder-large">
                <div className="placeholder-large-icon">
                  {CATEGORY_ICONS[product.category] || '📦'}
                </div>
                <div className="placeholder-large-text">{product.category}</div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info-section">
            <span className="product-category-badge">{product.category}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-price-large">€{product.price.toFixed(2)}</div>

            {product.shortDescription && (
              <p className="product-description">{product.shortDescription}</p>
            )}

            {/* Product Meta */}
            <div className="product-meta">
              {product.duration && (
                <div className="meta-item">
                  <span className="meta-label">⏱️ Duration:</span>
                  <span className="meta-value">{product.duration}</span>
                </div>
              )}
              <div className="meta-item">
                <span className="meta-label">📁 Format:</span>
                <span className="meta-value">{product.category}</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">💾 Download:</span>
                <span className="meta-value">Instant Access</span>
              </div>
              <div className="meta-item">
                <span className="meta-label">♾️ Access:</span>
                <span className="meta-value">Lifetime</span>
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h3>What's Included</h3>
                <div className="features-list">
                  {product.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="product-actions">
              <button onClick={handleAddToCart} className="btn-add-to-cart">
                🛒 Add to Cart
              </button>
              <button onClick={() => navigate('/products')} className="btn-continue-shopping">
                Continue Shopping
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="trust-indicators">
              <div className="trust-item">
                <span className="trust-icon">🔒</span>
                <span>Secure Payment</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">⚡</span>
                <span>Instant Download</span>
              </div>
              <div className="trust-item">
                <span className="trust-icon">✓</span>
                <span>Professional Quality</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Description */}
        {product.description && (
          <div className="product-content" style={{ marginTop: 'var(--spacing-3xl)' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <h2 style={{ marginBottom: 'var(--spacing-lg)', color: 'var(--color-charcoal)' }}>
                About This Program
              </h2>
              <p style={{ fontSize: 'var(--font-size-lg)', lineHeight: 'var(--line-height-relaxed)', color: 'var(--color-dark-gray)' }}>
                {product.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductDetail;

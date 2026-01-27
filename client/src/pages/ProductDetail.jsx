import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/api';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };

  if (loading) {
    return <div className="loading">Loading product...</div>;
  }

  if (!product) {
    return (
      <div className="not-found">
        <h2>Product Not Found</h2>
        <button onClick={() => navigate('/products')} className="btn btn-primary">
          Back to Products
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
          <div className="product-image-large">
            {product.images && product.images[0] ? (
              <img src={product.images[0].url} alt={product.name} />
            ) : (
              <div className="product-placeholder-large">
                <span>{product.category}</span>
              </div>
            )}
          </div>

          <div className="product-details">
            <span className="product-category">{product.category}</span>
            <h1>{product.name}</h1>
            <div className="product-price-large">€{product.price.toFixed(2)}</div>

            {product.shortDescription && (
              <p className="short-description">{product.shortDescription}</p>
            )}

            <div className="product-meta">
              {product.duration && (
                <div className="meta-item">
                  <span className="meta-label">Duration:</span>
                  <span className="meta-value">{product.duration}</span>
                </div>
              )}
              {product.category && (
                <div className="meta-item">
                  <span className="meta-label">Type:</span>
                  <span className="meta-value">{product.category}</span>
                </div>
              )}
            </div>

            <button onClick={handleAddToCart} className="btn btn-primary btn-lg btn-block">
              Add to Cart
            </button>

            <div className="product-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            {product.features && product.features.length > 0 && (
              <div className="product-features">
                <h2>What's Included</h2>
                <ul>
                  {product.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.tags && product.tags.length > 0 && (
              <div className="product-tags">
                {product.tags.map((tag, index) => (
                  <span key={index} className="tag">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;

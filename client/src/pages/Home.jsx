import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import './Home.css';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      const response = await getProducts({ limit: 6, status: 'active' });
      setFeaturedProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1>Transform Your Life Through Hypnotherapy</h1>
          <p>Professional digital hypnotherapy courses and audio programs designed to help you achieve your goals</p>
          <div className="hero-buttons">
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
            <Link to="/about" className="btn btn-secondary">Learn More</Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-products">
        <div className="container">
          <h2>Featured Products</h2>
          <p className="section-subtitle">Discover our most popular hypnotherapy programs</p>

          {loading ? (
            <div className="loading">Loading products...</div>
          ) : (
            <div className="products-grid">
              {featuredProducts.map((product) => (
                <Link to={`/products/${product._id}`} key={product._id} className="product-card">
                  <div className="product-image">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="product-placeholder">
                        <span>{product.category}</span>
                      </div>
                    )}
                  </div>
                  <div className="product-info">
                    <span className="product-category">{product.category}</span>
                    <h3>{product.name}</h3>
                    <p>{product.shortDescription || product.description?.substring(0, 100)}</p>
                    <div className="product-footer">
                      <span className="product-price">€{product.price.toFixed(2)}</span>
                      {product.duration && <span className="product-duration">{product.duration}</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="view-all">
            <Link to="/products" className="btn btn-outline">View All Products</Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="benefits">
        <div className="container">
          <h2>Why Choose Our Hypnotherapy Programs?</h2>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">🎧</div>
              <h3>Professional Quality</h3>
              <p>All programs created by certified hypnotherapists with years of experience</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">📱</div>
              <h3>Instant Access</h3>
              <p>Download immediately after purchase and access on any device</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">🔒</div>
              <h3>Secure & Private</h3>
              <p>Your purchases and personal information are completely secure</p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">💰</div>
              <h3>Great Value</h3>
              <p>One-time payment for lifetime access to your programs</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="container">
          <h2>Ready to Begin Your Transformation?</h2>
          <p>Explore our collection of hypnotherapy programs and start your journey today</p>
          <Link to="/products" className="btn btn-primary btn-lg">Get Started</Link>
        </div>
      </section>
    </div>
  );
}

export default Home;

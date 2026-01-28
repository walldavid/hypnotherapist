import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getProductsByCategory } from '../services/api';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import './Products.css';

const CATEGORIES = ['all', 'audio', 'course', 'pdf', 'video', 'bundle'];

const CATEGORY_ICONS = {
  all: '🎯',
  audio: '🎧',
  course: '📚',
  pdf: '📄',
  video: '🎥',
  bundle: '📦'
};

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart } = useCart();

  const selectedCategory = searchParams.get('category') || 'all';

  useEffect(() => {
    loadProducts();
  }, [selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      let response;
      if (selectedCategory === 'all') {
        response = await getProducts({ status: 'active' });
      } else {
        response = await getProductsByCategory(selectedCategory);
      }
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (category) => {
    if (category === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const handleAddToCart = (product, e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
    toast.success('Added to cart!');
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Hypnotherapy Programs</h1>
        <p>Professional digital programs to support your personal transformation journey</p>
      </div>

      {/* Category Filter */}
      <div className="category-filters">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category)}
          >
            <span className="category-icon">{CATEGORY_ICONS[category]}</span>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </button>
        ))}
      </div>

      {/* Products Container */}
      <div className="products-container">
        {loading ? (
          <div className="loading">Loading programs...</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>No Programs Found</h2>
            <p>There are no programs available in this category yet. Check back soon!</p>
            <button 
              className="btn btn-primary"
              onClick={() => handleCategoryChange('all')}
            >
              View All Programs
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-link">
                  <div className="product-card-image">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="image-placeholder">
                        <div className="placeholder-icon">
                          {CATEGORY_ICONS[product.category] || '📦'}
                        </div>
                        <div className="placeholder-text">{product.category}</div>
                      </div>
                    )}
                  </div>
                  <div className="product-card-content">
                    <span className="product-card-category">{product.category}</span>
                    <h3 className="product-card-title">{product.name}</h3>
                    <p className="product-card-description">
                      {product.shortDescription || product.description?.substring(0, 120)}
                    </p>
                    <div className="product-card-footer">
                      <span className="product-card-price">
                        €{product.price.toFixed(2)}
                      </span>
                      <div className="product-card-actions">
                        <button
                          className="btn-add-cart"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          🛒 Add to Cart
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getProducts, getProductsByCategory } from '../services/api';
import { useCart } from '../context/CartContext';
import './Products.css';

const CATEGORIES = ['all', 'audio', 'course', 'pdf', 'video', 'bundle'];

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
      setProducts(response.data.products);
    } catch (error) {
      console.error('Error loading products:', error);
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

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Our Products</h1>
        <p>Browse our collection of professional hypnotherapy programs</p>
      </div>

      <div className="container">
        {/* Category Filter */}
        <div className="category-filter">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products found in this category.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <div key={product._id} className="product-card">
                <Link to={`/products/${product._id}`} className="product-image-link">
                  <div className="product-image">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0].url} alt={product.name} />
                    ) : (
                      <div className="product-placeholder">
                        <span>{product.category}</span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <Link to={`/products/${product._id}`}>
                    <h3>{product.name}</h3>
                  </Link>
                  <p>{product.shortDescription || product.description?.substring(0, 120) + '...'}</p>
                  <div className="product-footer">
                    <span className="product-price">€{product.price.toFixed(2)}</span>
                    {product.duration && <span className="product-duration">{product.duration}</span>}
                  </div>
                  <button
                    className="btn btn-primary btn-block"
                    onClick={() => addToCart(product)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Products;

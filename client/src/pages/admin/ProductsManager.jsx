import AdminNav from '../../components/AdminNav';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './ProductsManager.css';

function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    category: 'audio',
    status: 'active',
    duration: '',
    features: '',
    tags: ''
  });
  const [files, setFiles] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      if (formData.shortDescription) data.append('shortDescription', formData.shortDescription);
      data.append('price', parseFloat(formData.price));
      data.append('category', formData.category);
      data.append('status', formData.status);
      if (formData.duration) data.append('duration', formData.duration);
      
      // Handle features (comma-separated)
      if (formData.features) {
        const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
        data.append('features', JSON.stringify(featuresArray));
      }
      
      // Handle tags (comma-separated)
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(t => t);
        data.append('tags', JSON.stringify(tagsArray));
      }

      // Add product files
      files.forEach(file => {
        data.append('files', file);
      });

      // Add image files
      imageFiles.forEach(file => {
        data.append('images', file);
      });

      if (editingProduct) {
        await api.put(`/admin/products/${editingProduct._id}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product updated successfully');
      } else {
        await api.post('/admin/products', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Product created successfully');
      }

      setShowModal(false);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Error saving product:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Failed to save product';
      toast.error(errorMsg);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription || '',
      price: product.price,
      category: product.category,
      status: product.status,
      duration: product.duration || '',
      features: product.features?.join(', ') || '',
      tags: product.tags?.join(', ') || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await api.delete(`/admin/products/${productId}`);
      toast.success('Product deleted successfully');
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      category: 'audio',
      status: 'active',
      duration: '',
      features: '',
      tags: ''
    });
    setFiles([]);
    setImageFiles([]);
    setEditingProduct(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading products...</div></div>;
  }

  return (
    <>
      <AdminNav />
      <div className="admin-page">
        <div className="page-header">
          <div>
            <h1>Manage Products</h1>
            <p>Add, edit, and manage your hypnotherapy products</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            + Add Product
          </button>
        </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products yet. Create your first product!</p>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-header">
                <h3>{product.name}</h3>
                <span className={`badge badge-${product.status}`}>
                  {product.status}
                </span>
              </div>
              <p className="product-description">{product.description}</p>
              <div className="product-meta">
                <span className="product-category">{product.category}</span>
                <span className="product-price">{formatCurrency(product.price)}</span>
              </div>
              <div className="product-files">
                {product.files?.length > 0 && (
                  <span>{product.files.length} file(s)</span>
                )}
              </div>
              <div className="product-actions">
                <button onClick={() => handleEdit(product)} className="btn btn-secondary btn-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(product._id)} className="btn btn-danger btn-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => {setShowModal(false); resetForm();}}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button className="modal-close" onClick={() => {setShowModal(false); resetForm();}}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  required
                  placeholder="Full description of the product"
                />
              </div>

              <div className="form-group">
                <label>Short Description</label>
                <textarea
                  name="shortDescription"
                  value={formData.shortDescription}
                  onChange={handleInputChange}
                  rows="2"
                  maxLength="300"
                  placeholder="Brief summary for product cards (optional, max 300 chars)"
                />
                <small>{formData.shortDescription.length}/300 characters</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (EUR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    placeholder="9.99"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select name="category" value={formData.category} onChange={handleInputChange}>
                    <option value="audio">Audio</option>
                    <option value="course">Course</option>
                    <option value="pdf">PDF</option>
                    <option value="video">Video</option>
                    <option value="bundle">Bundle</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 45 minutes, 6 hours"
                />
                <small>Optional - specify duration for audio/video/course</small>
              </div>

              <div className="form-group">
                <label>Features</label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Feature 1, Feature 2, Feature 3"
                />
                <small>Comma-separated list of product features (what's included)</small>
              </div>

              <div className="form-group">
                <label>Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="stress relief, anxiety, sleep"
                />
                <small>Comma-separated tags for categorization and search</small>
              </div>

              <div className="form-group">
                <label>Product Image</label>
                <input
                  type="file"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <small>Upload a preview image for the product card (JPG, PNG, WEBP)</small>
                {imageFiles.length > 0 && (
                  <div style={{ marginTop: '8px', color: 'var(--color-secondary-dark)' }}>
                    ✓ {imageFiles[0].name} selected
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Product Files</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.mp3,.mp4,.zip"
                />
                <small>Upload downloadable files (PDF, MP3, MP4, ZIP) - requires Google Cloud Storage setup</small>
                {files.length > 0 && (
                  <div style={{ marginTop: '8px', color: 'var(--color-secondary-dark)' }}>
                    ✓ {files.length} file(s) selected
                  </div>
                )}
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => {setShowModal(false); resetForm();}} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default ProductsManager;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './OrdersManager.css';

function OrdersManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.paymentStatus === filter;
  });

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return <div className="admin-page"><div className="loading">Loading orders...</div></div>;
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <div>
          <Link to="/admin/dashboard" className="back-link">← Back to Dashboard</Link>
          <h1>Manage Orders</h1>
        </div>
      </div>

      <div className="orders-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All Orders ({orders.length})
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Completed ({orders.filter(o => o.paymentStatus === 'completed').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({orders.filter(o => o.paymentStatus === 'pending').length})
        </button>
        <button 
          className={`filter-btn ${filter === 'failed' ? 'active' : ''}`}
          onClick={() => setFilter('failed')}
        >
          Failed ({orders.filter(o => o.paymentStatus === 'failed').length})
        </button>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <p>No {filter !== 'all' ? filter : ''} orders found</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => (
                <tr key={order._id}>
                  <td className="order-number">{order.orderNumber}</td>
                  <td>{order.customerEmail}</td>
                  <td>{order.items?.length || 0} item(s)</td>
                  <td className="amount">{formatCurrency(order.totalAmount)}</td>
                  <td className="payment-method">
                    {order.paymentMethod || 'N/A'}
                  </td>
                  <td>
                    <span className={`status status-${order.paymentStatus}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td>{formatDate(order.createdAt)}</td>
                  <td>
                    <button 
                      onClick={() => viewOrderDetails(order)} 
                      className="btn btn-sm btn-secondary"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content order-details" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="order-info">
              <div className="info-section">
                <h3>Order Information</h3>
                <div className="info-row">
                  <span className="label">Order Number:</span>
                  <span className="value">{selectedOrder.orderNumber}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span className={`status status-${selectedOrder.paymentStatus}`}>
                    {selectedOrder.paymentStatus}
                  </span>
                </div>
                <div className="info-row">
                  <span className="label">Date:</span>
                  <span className="value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Payment Method:</span>
                  <span className="value">{selectedOrder.paymentMethod || 'N/A'}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Customer Information</h3>
                <div className="info-row">
                  <span className="label">Email:</span>
                  <span className="value">{selectedOrder.customerEmail}</span>
                </div>
              </div>

              <div className="info-section">
                <h3>Order Items</h3>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-name">{item.name}</div>
                    <div className="item-price">{formatCurrency(item.price)}</div>
                  </div>
                ))}
                <div className="order-total">
                  <span className="label">Total:</span>
                  <span className="value">{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {selectedOrder.downloads && selectedOrder.downloads.length > 0 && (
                <div className="info-section">
                  <h3>Download Tokens</h3>
                  {selectedOrder.downloads.map((download, index) => (
                    <div key={index} className="download-token">
                      <div className="token-product">{download.productName}</div>
                      <div className="token-info">
                        <span>Token: {download.token}</span>
                        <span>Downloads: {download.downloadCount}/{download.maxDownloads}</span>
                        <span>Expires: {formatDate(download.expiresAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="btn btn-primary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersManager;

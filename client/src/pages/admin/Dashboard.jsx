import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import AdminNav from '../../components/AdminNav';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);
  const { admin } = useAdmin();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        api.get('/products'),
        api.get('/admin/orders')
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];

      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'completed')
        .reduce((sum, order) => sum + order.totalAmount, 0);

      setStats({
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        recentOrders: orders.slice(0, 5)
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (loading) {
    return (
      <>
        <AdminNav />
        <div className="admin-dashboard">
          <div className="loading">Loading dashboard...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNav />
      <div className="admin-dashboard">
        <div className="dashboard-header">
          <div>
            <h1>Dashboard</h1>
            <p>Overview of your hypnotherapy products and orders</p>
          </div>
        </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🛒</div>
          <div className="stat-content">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/admin/products" className="action-card">
          <div className="action-icon">📝</div>
          <h3>Manage Products</h3>
          <p>Add, edit, or remove products</p>
        </Link>

        <Link to="/admin/orders" className="action-card">
          <div className="action-icon">📋</div>
          <h3>View Orders</h3>
          <p>Track and manage customer orders</p>
        </Link>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        {stats.recentOrders.length === 0 ? (
          <p className="no-orders">No orders yet</p>
        ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order.orderNumber}</td>
                    <td>{order.customerEmail}</td>
                    <td>{formatCurrency(order.totalAmount)}</td>
                    <td>
                      <span className={`status status-${order.paymentStatus}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
}

export default Dashboard;

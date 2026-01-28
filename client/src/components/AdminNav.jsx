import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { toast } from 'react-toastify';
import './AdminNav.css';

function AdminNav() {
  const { admin, logout } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.info('Logged out successfully');
    navigate('/admin/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="admin-nav">
      <div className="admin-nav-container">
        <div className="admin-nav-brand">
          <Link to="/admin/dashboard">
            <h2>Admin Panel</h2>
          </Link>
          {admin && <span className="admin-name">👤 {admin.username}</span>}
        </div>
        
        <div className="admin-nav-links">
          <Link 
            to="/admin/dashboard" 
            className={isActive('/admin/dashboard') ? 'active' : ''}
          >
            Dashboard
          </Link>
          <Link 
            to="/admin/products" 
            className={isActive('/admin/products') ? 'active' : ''}
          >
            Products
          </Link>
          <Link 
            to="/admin/orders" 
            className={isActive('/admin/orders') ? 'active' : ''}
          >
            Orders
          </Link>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default AdminNav;

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import { CartProvider, useCart } from './context/CartContext'
import { AdminProvider } from './context/AdminContext'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './App.css'

// Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Download from './pages/Download'

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import ProductsManager from './pages/admin/ProductsManager'
import OrdersManager from './pages/admin/OrdersManager'

function App() {
  return (
    <CartProvider>
      <AdminProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/download" element={<Download />} />
                
                {/* Admin Routes */
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route 
                  path="/admin/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/products" 
                  element={
                    <ProtectedRoute>
                      <ProductsManager />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/orders" 
                  element={
                    <ProtectedRoute>
                      <OrdersManager />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <ToastContainer position="bottom-right" autoClose={3000} />
          </div>
        </Router>
      </AdminProvider>
    </CartProvider>
  )
}

function Navbar() {
  const { getCartCount } = useCart()

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="nav-brand">
          <h1>Hypnotherapist.ie</h1>
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/products">Products</Link>
          <Link to="/cart" className="cart-link">
            Cart
            {getCartCount() > 0 && (
              <span className="cart-badge">{getCartCount()}</span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; 2026 Hypnotherapist.ie - All rights reserved</p>
        <p>Professional hypnotherapy programs for personal transformation</p>
      </div>
    </footer>
  )
}

export default App

import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Cart.css';

function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <div className="container">
          <h2>Your Cart is Empty</h2>
          <p>Add some products to get started!</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Shopping Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.map((item) => (
              <div key={item.product._id} className="cart-item">
                <div className="item-image">
                  {item.product.images && item.product.images[0] ? (
                    <img src={item.product.images[0].url} alt={item.product.name} />
                  ) : (
                    <div className="item-placeholder">{item.product.category}</div>
                  )}
                </div>

                <div className="item-details">
                  <Link to={`/products/${item.product._id}`}>
                    <h3>{item.product.name}</h3>
                  </Link>
                  <p className="item-category">{item.product.category}</p>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                    className="qty-btn"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-price">
                  €{(item.product.price * item.quantity).toFixed(2)}
                </div>

                <button
                  onClick={() => removeFromCart(item.product._id)}
                  className="item-remove"
                  title="Remove from cart"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>
            <div className="summary-row">
              <span>Tax</span>
              <span>€0.00</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>€{getCartTotal().toFixed(2)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn btn-primary btn-lg btn-block"
            >
              Proceed to Checkout
            </button>

            <button
              onClick={() => navigate('/products')}
              className="btn btn-outline btn-block"
            >
              Continue Shopping
            </button>

            <button
              onClick={clearCart}
              className="btn-text"
            >
              Clear Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;

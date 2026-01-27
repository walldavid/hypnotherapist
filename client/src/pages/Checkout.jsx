import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder, createStripeCheckout, createPayPalOrder } from '../services/api';
import { toast } from 'react-toastify';
import './Checkout.css';

function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerEmail: '',
    customerName: '',
    paymentMethod: 'stripe',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderData = {
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        items: cart.map((item) => ({
          product: item.product._id,
          quantity: item.quantity,
        })),
        paymentMethod: formData.paymentMethod,
      };

      const orderResponse = await createOrder(orderData);
      const order = orderResponse.data;

      // Redirect to payment
      if (formData.paymentMethod === 'stripe') {
        const stripeResponse = await createStripeCheckout(order._id);
        window.location.href = stripeResponse.data.url;
      } else if (formData.paymentMethod === 'paypal') {
        const paypalResponse = await createPayPalOrder(order._id);
        const approveLink = paypalResponse.data.links.find((link) => link.rel === 'approve');
        if (approveLink) {
          window.location.href = approveLink.href;
        }
      }

      // Clear cart
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error(error.response?.data?.error || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <form onSubmit={handleSubmit} className="checkout-form">
            <div className="form-section">
              <h2>Contact Information</h2>
              <div className="form-group">
                <label htmlFor="customerName">Full Name</label>
                <input
                  type="text"
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customerEmail">Email Address</label>
                <input
                  type="email"
                  id="customerEmail"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
                <small>You'll receive download links at this email</small>
              </div>
            </div>

            <div className="form-section">
              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className={`payment-method ${formData.paymentMethod === 'stripe' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="stripe"
                    checked={formData.paymentMethod === 'stripe'}
                    onChange={handleInputChange}
                  />
                  <div className="method-info">
                    <strong>Credit Card</strong>
                    <span>Powered by Stripe</span>
                  </div>
                </label>

                <label className={`payment-method ${formData.paymentMethod === 'paypal' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={formData.paymentMethod === 'paypal'}
                    onChange={handleInputChange}
                  />
                  <div className="method-info">
                    <strong>PayPal</strong>
                    <span>Pay with your PayPal account</span>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg btn-block"
              disabled={loading}
            >
              {loading ? 'Processing...' : `Pay €${getCartTotal().toFixed(2)}`}
            </button>
          </form>

          <div className="order-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cart.map((item) => (
                <div key={item.product._id} className="summary-item">
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>€{(item.product.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="summary-totals">
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
            </div>

            <div className="checkout-note">
              <p>🔒 Secure checkout</p>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;

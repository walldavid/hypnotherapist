// Email service (placeholder for SendGrid or Nodemailer)

// Send order confirmation email
exports.sendOrderConfirmation = async (order) => {
  try {
    // TODO: Implement email sending with SendGrid or Nodemailer
    // npm install @sendgrid/mail or nodemailer

    console.log(`Sending order confirmation email to ${order.customerEmail}`);
    console.log(`Order Number: ${order.orderNumber}`);
    console.log(`Total: €${order.total.toFixed(2)}`);

    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail');
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // 
    // const msg = {
    //   to: order.customerEmail,
    //   from: process.env.EMAIL_FROM,
    //   subject: `Order Confirmation - ${order.orderNumber}`,
    //   html: generateOrderEmailHTML(order)
    // };
    // 
    // await sgMail.send(msg);

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    throw error;
  }
};

// Send download links email
exports.sendDownloadLinks = async (order) => {
  try {
    console.log(`Sending download links to ${order.customerEmail}`);

    // TODO: Implement email with download links

    return { success: true };
  } catch (error) {
    console.error('Error sending download links email:', error);
    throw error;
  }
};

// Generate order confirmation email HTML
function generateOrderEmailHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.productName}</td>
      <td>${item.quantity}</td>
      <td>€${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { font-size: 1.2em; font-weight: bold; text-align: right; }
        .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Thank You for Your Order!</h1>
        </div>
        <div class="content">
          <h2>Order #${order.orderNumber}</h2>
          <p>Hi ${order.customerName || 'there'},</p>
          <p>Your order has been confirmed and your download links are ready!</p>
          
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHTML}
            </tbody>
          </table>
          
          <p class="total">Total: €${order.total.toFixed(2)}</p>
          
          <a href="${process.env.CLIENT_URL}/downloads/${order.orderNumber}" class="button">
            Access Your Downloads
          </a>
          
          <p>Your download links will be valid for 48 hours.</p>
          <p>If you have any questions, please contact us at ${process.env.EMAIL_FROM}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

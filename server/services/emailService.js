const nodemailer = require('nodemailer');

// Create reusable transporter
let transporter = null;

function getTransporter() {
  if (!transporter) {
    // Check if email is configured
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
      console.warn('Email service not configured. Set EMAIL_HOST, EMAIL_USER, and EMAIL_PASSWORD in .env');
      return null;
    }

    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT) || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  return transporter;
}

// Send order confirmation email with download links
exports.sendOrderConfirmation = async (order) => {
  try {
    const transport = getTransporter();
    if (!transport) {
      console.log('Email not configured - skipping order confirmation email');
      return { success: false, message: 'Email not configured' };
    }

    const downloadLinksHTML = order.downloads.map(download => `
      <div style="margin: 15px 0; padding: 15px; background: #f8f9fa; border-radius: 8px;">
        <h3 style="margin: 0 0 10px 0; color: #333;">${download.productName}</h3>
        <a href="${process.env.CLIENT_URL}/download?token=${download.token}" 
           style="display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">
          Download Files
        </a>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">
          Valid until ${new Date(download.expiresAt).toLocaleDateString('en-IE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    `).join('');

    const itemsHTML = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">€${item.price.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 30px 20px; }
          .order-number { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .order-number strong { font-size: 18px; color: #333; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          .total { font-size: 18px; font-weight: bold; text-align: right; padding: 15px 10px; border-top: 2px solid #333; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 14px; background: #f8f9fa; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✓ Order Confirmed!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Thank you for your purchase</p>
          </div>
          
          <div class="content">
            <div class="order-number">
              <strong>Order #${order.orderNumber}</strong>
            </div>

            <p>Dear ${order.customerEmail},</p>
            <p>Your payment has been processed successfully and your digital products are ready to download!</p>

            <h2 style="color: #333; margin-top: 30px;">Your Downloads</h2>
            ${downloadLinksHTML}

            <h2 style="color: #333; margin-top: 30px;">Order Summary</h2>
            <table>
              <tbody>
                ${itemsHTML}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="2" class="total">Total: €${order.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            <div style="margin: 30px 0; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
              <p style="margin: 0; color: #856404;"><strong>Important:</strong></p>
              <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #856404;">
                <li>Download links are valid for 48 hours</li>
                <li>You can download each product up to ${order.downloads[0]?.maxDownloads || 5} times</li>
                <li>Save your files immediately after downloading</li>
              </ul>
            </div>

            <p>If you have any questions or need assistance, please reply to this email.</p>
            <p>Best regards,<br><strong>Hypnotherapist.ie Team</strong></p>
          </div>

          <div class="footer">
            <p>© ${new Date().getFullYear()} Hypnotherapist.ie - All rights reserved</p>
            <p>Professional hypnotherapy programs for personal transformation</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Hypnotherapist.ie" <${process.env.EMAIL_USER}>`,
      to: order.customerEmail,
      subject: `Your Order Confirmation - ${order.orderNumber}`,
      html: html
    };

    await transport.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${order.customerEmail}`);

    return { success: true };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    // Don't throw - email failure shouldn't break the order process
    return { success: false, error: error.message };
  }
};

// Send admin notification for new order
exports.sendAdminNotification = async (order) => {
  try {
    const transport = getTransporter();
    if (!transport || !process.env.ADMIN_EMAIL) {
      console.log('Admin email notification not configured');
      return { success: false, message: 'Admin email not configured' };
    }

    const itemsHTML = order.items.map(item => `
      <li>${item.name} - €${item.price.toFixed(2)}</li>
    `).join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
          .info { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 New Order Received</h2>
          </div>
          <div class="content">
            <div class="info">
              <strong>Order Number:</strong> ${order.orderNumber}<br>
              <strong>Customer:</strong> ${order.customerEmail}<br>
              <strong>Total:</strong> €${order.totalAmount.toFixed(2)}<br>
              <strong>Payment Method:</strong> ${order.paymentMethod}<br>
              <strong>Date:</strong> ${new Date(order.createdAt).toLocaleString('en-IE')}
            </div>

            <h3>Items:</h3>
            <ul>${itemsHTML}</ul>

            <p><a href="${process.env.CLIENT_URL}/admin/orders" style="color: #667eea;">View in Admin Dashboard</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Hypnotherapist.ie" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Order: ${order.orderNumber} - €${order.totalAmount.toFixed(2)}`,
      html: html
    };

    await transport.sendMail(mailOptions);
    console.log(`Admin notification sent for order ${order.orderNumber}`);

    return { success: true };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error: error.message };
  }
};

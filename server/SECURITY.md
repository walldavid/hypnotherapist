# Security Implementation Guide

This document outlines the security measures implemented in the Hypnotherapist.ie e-commerce platform.

## Overview

The application implements multiple layers of security to protect against common web vulnerabilities and attacks.

## Security Features Implemented

### 1. Helmet.js - Security Headers

**Package**: `helmet`
**Purpose**: Sets various HTTP headers to protect against common attacks

**Configured Headers:**
- **Content-Security-Policy (CSP)**: Restricts resource loading
  - Scripts allowed from: self, Stripe, PayPal
  - Styles allowed from: self (with inline styles for React)
  - Frames allowed from: Stripe, PayPal (for payment widgets)
  
- **X-Frame-Options**: Prevents clickjacking attacks
- **X-Content-Type-Options**: Prevents MIME-type sniffing
- **X-XSS-Protection**: Enables browser XSS protection
- **Strict-Transport-Security**: Forces HTTPS connections (in production)

**Configuration** (server.js):
```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "js.stripe.com", "www.paypal.com"],
      frameSrc: ["js.stripe.com", "www.paypal.com"],
      // ... more directives
    }
  }
}));
```

### 2. Rate Limiting

**Package**: `express-rate-limit`
**Purpose**: Prevents brute force attacks and API abuse

**Rate Limits Configured:**

#### General API Limit
- **Limit**: 100 requests per 15 minutes per IP
- **Applied to**: All `/api/*` routes
- **Purpose**: Prevent general API abuse

#### Authentication Limit
- **Limit**: 5 login attempts per 15 minutes per IP
- **Applied to**: `/api/admin/login`
- **Purpose**: Prevent brute force password attacks
- **Feature**: Skips successful requests (only counts failed attempts)

#### Order Creation Limit
- **Limit**: 10 orders per hour per IP
- **Applied to**: `/api/orders`
- **Purpose**: Prevent order spam and fraud

#### Download Limit
- **Limit**: 50 downloads per hour per IP
- **Applied to**: `/api/downloads`
- **Purpose**: Prevent download abuse

**Configuration Example:**
```javascript
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
});
```

### 3. CORS (Cross-Origin Resource Sharing)

**Package**: `cors`
**Purpose**: Controls which domains can access the API

**Configuration:**
- **Origin**: Only CLIENT_URL is allowed (default: http://localhost:3000)
- **Credentials**: Enabled (allows cookies/auth headers)
- **Methods**: GET, POST, PUT, DELETE
- **Preflight**: Automatically handled

**Environment Variable:**
```env
CLIENT_URL=http://localhost:3000  # or https://hypnotherapist.ie
```

**Configuration:**
```javascript
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
```

### 4. NoSQL Injection Protection

**Package**: `express-mongo-sanitize`
**Purpose**: Sanitizes user input to prevent NoSQL injection attacks

**What it does:**
- Removes `$` and `.` characters from user input
- Prevents malicious MongoDB operators in queries
- Sanitizes query strings, body, and params

**Example Attack Prevented:**
```javascript
// Malicious input:
{ "email": { "$gt": "" } }  // Would match all emails

// After sanitization:
{ "email": "" }  // Safe
```

### 5. Input Validation

**Package**: `express-validator`
**Location**: `middleware/validation.js`

**Validation Rules:**
- Email format validation
- Required field checks
- String length limits
- Number range validation
- Enum value validation

**Example:**
```javascript
// In validation.js
validateOrder: [
  body('customerEmail').isEmail().normalizeEmail(),
  body('items').isArray({ min: 1 }),
  body('items.*.productId').isMongoId(),
  // ... more validations
]
```

### 6. Authentication & Authorization

**JWT Tokens:**
- Secure token generation with strong secret
- 24-hour expiry
- Stored in localStorage (client)
- Verified on every protected route

**Admin Account Security:**
- Passwords hashed with bcrypt (10 salt rounds)
- Account lockout after 5 failed attempts (2 hours)
- Login attempts tracked per user
- Last login timestamp recorded

**Password Requirements:**
- Minimum 8 characters (enforced in Admin model)
- Should contain mix of letters, numbers, symbols

### 7. File Upload Security

**Package**: `multer`
**Location**: `middleware/upload.js`

**Security Measures:**
- File type validation (whitelist approach)
- File size limits (500MB max per file)
- Number of files limit (10 max per upload)
- Memory storage (files not saved to disk)
- Immediate upload to GCS (no local storage)

**Allowed File Types:**
```javascript
const allowedTypes = [
  'application/pdf',
  'audio/mpeg',
  'audio/wav',
  'video/mp4',
  'application/zip'
];
```

### 8. Payment Security

**Stripe & PayPal:**
- No credit card data stored in database
- All payment processing handled by payment providers
- Webhook signature verification
- Payment data only in provider's systems (PCI compliant)

**Webhook Security:**
- Signature verification for all webhooks
- Stripe webhook secret required
- PayPal webhook verification
- Invalid webhooks rejected

### 9. Download Security

**Secure Download Tokens:**
- Cryptographically secure random tokens
- Time-limited (48 hours default)
- Download count limited (5 times default)
- One-time use tokens (tracked)

**Google Cloud Storage:**
- Signed URLs with 1-hour expiry
- No direct file access
- Files not publicly accessible
- Temporary access only

### 10. Environment Variables

**Security Best Practices:**
- `.env` file in `.gitignore`
- No secrets committed to repository
- Different keys for dev/prod
- Strong JWT secret (32+ characters)
- Secure database credentials

### 11. Database Security

**MongoDB Security:**
- Connection string not exposed
- MongoDB Atlas with encryption at rest
- IP whitelist in production
- Database indexes for performance
- Query sanitization enabled

**Indexes for Performance:**
```javascript
// Product
productSchema.index({ status: 1, createdAt: -1 });
productSchema.index({ category: 1 });

// Order
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerEmail: 1 });
orderSchema.index({ 'downloads.token': 1 });

// Admin
adminSchema.index({ username: 1 });
```

### 12. Compression

**Package**: `compression`
**Purpose**: Reduces response size, improves performance

**Benefits:**
- Gzip compression for all responses
- Reduces bandwidth by 70-90%
- Faster page loads
- Lower hosting costs

## Security Checklist

### Before Deployment

- [ ] Change all default passwords
- [ ] Generate strong JWT secret (32+ characters)
- [ ] Set up proper CORS with production domain
- [ ] Enable HTTPS/SSL certificate
- [ ] Set up MongoDB Atlas IP whitelist
- [ ] Configure Stripe/PayPal production keys
- [ ] Set up GCS service account with minimal permissions
- [ ] Review all environment variables
- [ ] Set NODE_ENV=production
- [ ] Test rate limiting
- [ ] Test admin account lockout
- [ ] Verify webhook signatures work
- [ ] Test CSP doesn't block legitimate resources

### Regular Maintenance

- [ ] Monitor rate limit violations
- [ ] Review authentication logs
- [ ] Check for suspicious orders
- [ ] Update dependencies monthly
- [ ] Rotate secrets quarterly
- [ ] Review access logs
- [ ] Test backup restoration
- [ ] Security audit quarterly

## Common Attacks & Mitigations

### 1. SQL/NoSQL Injection
**Mitigation**: express-mongo-sanitize, parameterized queries

### 2. Cross-Site Scripting (XSS)
**Mitigation**: Helmet CSP, input sanitization, React's built-in XSS protection

### 3. Cross-Site Request Forgery (CSRF)
**Mitigation**: SameSite cookies, CORS configuration, token verification

### 4. Brute Force Attacks
**Mitigation**: Rate limiting, account lockout, strong passwords

### 5. DDoS Attacks
**Mitigation**: Rate limiting, CloudFlare (recommended), GCP load balancing

### 6. Man-in-the-Middle (MITM)
**Mitigation**: HTTPS/TLS, HSTS header, secure cookies

### 7. File Upload Attacks
**Mitigation**: File type validation, size limits, virus scanning (recommended)

### 8. Session Hijacking
**Mitigation**: JWT with expiry, secure cookies, logout functionality

## Testing Security

### Manual Testing

```bash
# Test rate limiting
for i in {1..10}; do
  curl http://localhost:5000/api/admin/login \
    -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"test","password":"test"}'
done

# Test CORS
curl -H "Origin: https://malicious.com" \
  http://localhost:5000/api/products

# Test input sanitization
curl http://localhost:5000/api/products \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name":{"$gt":""}}'
```

### Automated Testing

Consider using:
- **OWASP ZAP**: Security testing tool
- **npm audit**: Check for vulnerable dependencies
- **Snyk**: Continuous security monitoring

## Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** open a public GitHub issue
2. Email: security@hypnotherapist.ie
3. Include detailed steps to reproduce
4. Allow 48 hours for initial response

## Compliance

### GDPR Compliance
- Minimal data collection
- User consent for emails
- Data deletion on request
- Privacy policy required
- Cookie consent (if using cookies)

### PCI DSS Compliance
- No card data stored
- All payments through Stripe/PayPal
- PCI DSS compliant by design

## Additional Recommendations

### For Production

1. **Web Application Firewall (WAF)**
   - Use CloudFlare or GCP Cloud Armor
   - DDoS protection
   - Bot management

2. **Monitoring & Logging**
   - Set up error tracking (Sentry)
   - Log all authentication attempts
   - Monitor rate limit violations
   - Set up alerts for suspicious activity

3. **Backups**
   - Daily MongoDB backups
   - Store backups encrypted
   - Test restoration regularly
   - Keep 30 days of backups

4. **SSL/TLS**
   - Force HTTPS
   - Use TLS 1.2 or higher
   - Strong cipher suites
   - Regular certificate renewal

5. **Dependencies**
   - Run `npm audit` monthly
   - Update dependencies regularly
   - Review security advisories
   - Use dependabot or similar

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Node.js Security Checklist](https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## Version

Last Updated: January 27, 2026
Security Review: Pending
Next Review: April 2026

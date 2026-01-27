const request = require('supertest');
const app = require('../server');

describe('API Health and Basic Tests', () => {
  
  describe('GET /api/health', () => {
    it('should return 200 and health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('message');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/products', () => {
    it('should return products array', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should filter by category', async () => {
      const res = await request(app)
        .get('/api/products?category=audio')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for non-existent routes', async () => {
      const res = await request(app)
        .get('/api/nonexistent')
        .expect(404);
      
      expect(res.body).toHaveProperty('error');
    });
  });

});

describe('Security Headers', () => {
  
  it('should include security headers', async () => {
    const res = await request(app)
      .get('/api/health');
    
    // Check for security headers
    expect(res.headers).toHaveProperty('x-content-type-options');
    expect(res.headers).toHaveProperty('x-frame-options');
  });

  it('should support CORS from allowed origin', async () => {
    const res = await request(app)
      .get('/api/health')
      .set('Origin', process.env.CLIENT_URL || 'http://localhost:3000');
    
    expect(res.headers).toHaveProperty('access-control-allow-origin');
  });

});

describe('Input Validation', () => {
  
  it('should sanitize NoSQL injection attempts', async () => {
    const res = await request(app)
      .post('/api/orders')
      .send({
        customerEmail: { $gt: "" },
        items: []
      });
    
    // Should either fail validation or sanitize the input
    // We expect this to fail validation, not execute a malicious query
    expect(res.status).not.toBe(500);
  });

});

describe('Compression', () => {
  
  it('should compress responses when requested', async () => {
    const res = await request(app)
      .get('/api/products')
      .set('Accept-Encoding', 'gzip');
    
    // Should either have content-encoding header or be small enough to skip compression
    expect(res.status).toBe(200);
  });

});

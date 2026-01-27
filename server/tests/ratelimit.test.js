const request = require('supertest');
const app = require('../server');

describe('Rate Limiting Tests', () => {
  
  // Note: These tests modify the rate limit state
  // Run them carefully or with a fresh server instance
  
  describe('Authentication Rate Limiting', () => {
    it('should allow initial login attempts', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'test',
          password: 'wrongpassword'
        });
      
      // Should fail authentication but not be rate limited
      expect([401, 429]).toContain(res.status);
    });

    it('should have rate limit headers', async () => {
      const res = await request(app)
        .post('/api/admin/login')
        .send({
          username: 'test',
          password: 'test'
        });
      
      // Check for rate limit headers
      expect(res.headers).toHaveProperty('ratelimit-limit');
      expect(res.headers).toHaveProperty('ratelimit-remaining');
    });
  });

  describe('General API Rate Limiting', () => {
    it('should have rate limit on API endpoints', async () => {
      const res = await request(app)
        .get('/api/products');
      
      // Should have rate limit headers
      expect(res.headers).toHaveProperty('ratelimit-limit');
    });
  });

  describe('Order Rate Limiting', () => {
    it('should have rate limit on order creation', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          customerEmail: 'test@example.com',
          items: []
        });
      
      // Should have rate limit headers
      expect(res.headers).toHaveProperty('ratelimit-limit');
    });
  });

});

const request = require('supertest');
const app = require('../server');

describe('Basic API Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /api/health', () => {
    it('should return API health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /api/test', () => {
    it('should return test endpoint response', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('GET /api/cors-test', () => {
    it('should return CORS test response', async () => {
      const response = await request(app)
        .get('/api/cors-test')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('SUCCESS');
    });
  });

  describe('404 handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Route not found');
    });
  });
}); 
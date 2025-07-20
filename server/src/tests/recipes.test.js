const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const Recipe = require('../models/Recipe');
const User = require('../models/User');

describe('Recipe Endpoints', () => {
  let token;
  let user;
  let testRecipe;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recipe-share-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    // Create test user
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    // Get auth token
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    token = loginRes.body.token;

    // Create test recipe
    testRecipe = await Recipe.create({
      title: 'Test Recipe',
      description: 'A test recipe',
      ingredients: ['ingredient 1', 'ingredient 2'],
      instructions: ['step 1', 'step 2'],
      cookingTime: 30,
      servings: 4,
      difficulty: 'Easy',
      author: user._id
    });
  });

  describe('GET /api/recipes', () => {
    it('should get all recipes', async () => {
      const res = await request(app)
        .get('/api/recipes')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.recipes)).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);
    });

    it('should get recipes with pagination', async () => {
      const res = await request(app)
        .get('/api/recipes?page=1&limit=5')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBeLessThanOrEqual(5);
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should get a specific recipe', async () => {
      const res = await request(app)
        .get(`/api/recipes/${testRecipe._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipe.title).toBe('Test Recipe');
    });

    it('should return 404 for non-existent recipe', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/recipes/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/recipes', () => {
    it('should create a new recipe with valid data', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'A new test recipe',
        ingredients: ['ingredient 1', 'ingredient 2'],
        instructions: ['step 1', 'step 2'],
        cookingTime: 45,
        servings: 6,
        difficulty: 'Medium'
      };

      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(recipeData)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.recipe.title).toBe(recipeData.title);
      expect(res.body.recipe.author).toBe(user._id.toString());
    });

    it('should not create recipe without authentication', async () => {
      const recipeData = {
        title: 'New Recipe',
        description: 'A new test recipe'
      };

      const res = await request(app)
        .post('/api/recipes')
        .send(recipeData)
        .expect(401);

      expect(res.body.message).toContain('No token provided');
    });

    it('should validate required fields', async () => {
      const recipeData = {
        title: '',
        description: ''
      };

      const res = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${token}`)
        .send(recipeData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('PUT /api/recipes/:id', () => {
    it('should update recipe by owner', async () => {
      const updateData = {
        title: 'Updated Recipe Title',
        description: 'Updated description'
      };

      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipe.title).toBe(updateData.title);
    });

    it('should not update recipe by non-owner', async () => {
      // Create another user
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User'
      });

      const otherToken = (await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        })).body.token;

      const updateData = {
        title: 'Updated Recipe Title'
      };

      const res = await request(app)
        .put(`/api/recipes/${testRecipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .send(updateData)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('DELETE /api/recipes/:id', () => {
    it('should delete recipe by owner', async () => {
      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);

      // Verify recipe is deleted
      const getRes = await request(app)
        .get(`/api/recipes/${testRecipe._id}`)
        .expect(404);
    });

    it('should not delete recipe by non-owner', async () => {
      const otherUser = await User.create({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'password123',
        firstName: 'Other',
        lastName: 'User'
      });

      const otherToken = (await request(app)
        .post('/api/auth/login')
        .send({
          email: 'other@example.com',
          password: 'password123'
        })).body.token;

      const res = await request(app)
        .delete(`/api/recipes/${testRecipe._id}`)
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/recipes/search', () => {
    it('should search recipes by title', async () => {
      const res = await request(app)
        .get('/api/recipes/search?q=Test')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBeGreaterThan(0);
      expect(res.body.recipes[0].title).toContain('Test');
    });

    it('should return empty array for no matches', async () => {
      const res = await request(app)
        .get('/api/recipes/search?q=nonexistent')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBe(0);
    });
  });
}); 
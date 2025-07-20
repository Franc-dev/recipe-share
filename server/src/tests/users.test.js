const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../server');
const User = require('../models/User');
const Recipe = require('../models/Recipe');

describe('User Endpoints', () => {
  let token;
  let user;
  let otherUser;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/recipe-share-test');
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Recipe.deleteMany({});

    // Create test users
    user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User'
    });

    otherUser = await User.create({
      username: 'otheruser',
      email: 'other@example.com',
      password: 'password123',
      firstName: 'Other',
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
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .expect(401);

      expect(res.body.message).toContain('No token provided');
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        bio: 'Updated bio'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.firstName).toBe(updateData.firstName);
      expect(res.body.user.lastName).toBe(updateData.lastName);
      expect(res.body.user.bio).toBe(updateData.bio);
    });

    it('should not update email to existing email', async () => {
      const updateData = {
        email: 'other@example.com'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('should validate email format', async () => {
      const updateData = {
        email: 'invalid-email'
      };

      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get public user profile', async () => {
      const res = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.user.username).toBe('testuser');
      expect(res.body.user.email).toBeUndefined();
      expect(res.body.user.password).toBeUndefined();
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/users/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id/recipes', () => {
    beforeEach(async () => {
      // Create some test recipes
      await Recipe.create([
        {
          title: 'Recipe 1',
          description: 'First recipe',
          ingredients: ['ingredient 1'],
          instructions: ['step 1'],
          cookingTime: 30,
          servings: 4,
          difficulty: 'Easy',
          author: user._id
        },
        {
          title: 'Recipe 2',
          description: 'Second recipe',
          ingredients: ['ingredient 2'],
          instructions: ['step 2'],
          cookingTime: 45,
          servings: 6,
          difficulty: 'Medium',
          author: user._id
        },
        {
          title: 'Other Recipe',
          description: 'Other user recipe',
          ingredients: ['ingredient 3'],
          instructions: ['step 3'],
          cookingTime: 60,
          servings: 8,
          difficulty: 'Hard',
          author: otherUser._id
        }
      ]);
    });

    it('should get user recipes', async () => {
      const res = await request(app)
        .get(`/api/users/${user._id}/recipes`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBe(2);
      expect(res.body.recipes[0].author).toBe(user._id.toString());
    });

    it('should get user recipes with pagination', async () => {
      const res = await request(app)
        .get(`/api/users/${user._id}/recipes?page=1&limit=1`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBe(1);
    });

    it('should return empty array for user with no recipes', async () => {
      const newUser = await User.create({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User'
      });

      const res = await request(app)
        .get(`/api/users/${newUser._id}/recipes`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.recipes.length).toBe(0);
    });
  });

  describe('POST /api/users/:id/follow', () => {
    it('should follow a user', async () => {
      const res = await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('followed');

      // Verify following relationship
      const userRes = await request(app)
        .get(`/api/users/${user._id}`)
        .expect(200);

      expect(userRes.body.user.following).toContain(otherUser._id.toString());
    });

    it('should not follow yourself', async () => {
      const res = await request(app)
        .post(`/api/users/${user._id}/follow`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('cannot follow yourself');
    });

    it('should not follow already followed user', async () => {
      // First follow
      await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`);

      // Try to follow again
      const res = await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already following');
    });
  });

  describe('DELETE /api/users/:id/follow', () => {
    beforeEach(async () => {
      // Set up following relationship
      await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should unfollow a user', async () => {
      const res = await request(app)
        .delete(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('unfollowed');
    });

    it('should not unfollow user you are not following', async () => {
      // First unfollow
      await request(app)
        .delete(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`);

      // Try to unfollow again
      const res = await request(app)
        .delete(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('not following');
    });
  });

  describe('GET /api/users/:id/followers', () => {
    beforeEach(async () => {
      // Set up following relationship
      await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should get user followers', async () => {
      const res = await request(app)
        .get(`/api/users/${otherUser._id}/followers`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.followers.length).toBe(1);
      expect(res.body.followers[0]._id).toBe(user._id.toString());
    });
  });

  describe('GET /api/users/:id/following', () => {
    beforeEach(async () => {
      // Set up following relationship
      await request(app)
        .post(`/api/users/${otherUser._id}/follow`)
        .set('Authorization', `Bearer ${token}`);
    });

    it('should get user following', async () => {
      const res = await request(app)
        .get(`/api/users/${user._id}/following`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.following.length).toBe(1);
      expect(res.body.following[0]._id).toBe(otherUser._id.toString());
    });
  });
}); 
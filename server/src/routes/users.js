/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Public
router.get('/profile/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('myRecipes', 'title image averageRating totalReviews createdAt')
      .populate('favoriteRecipes', 'title image averageRating totalReviews createdAt');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user profile'
    });
  }
});

// @route   GET /api/users/my-recipes
// @desc    Get current user's recipes
// @access  Private
router.get('/my-recipes', auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ author: req.user._id })
      .populate('author', 'username firstName lastName avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Get my recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching your recipes'
    });
  }
});

// @route   GET /api/users/favorites
// @desc    Get current user's favorite recipes
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate({
        path: 'favoriteRecipes',
        populate: {
          path: 'author',
          select: 'username firstName lastName avatar'
        }
      });

    res.json({
      success: true,
      data: user.favoriteRecipes
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favorites'
    });
  }
});

// @route   GET /api/users/search
// @desc    Search users
// @access  Public
router.get('/search', [
  body('query')
    .optional()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty')
], async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username firstName lastName avatar bio')
    .limit(10);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching users'
    });
  }
});

// @route   GET /api/users/top-chefs
// @desc    Get top chefs (users with most recipes)
// @access  Public
router.get('/top-chefs', async (req, res) => {
  try {
    const topChefs = await User.aggregate([
      {
        $lookup: {
          from: 'recipes',
          localField: '_id',
          foreignField: 'author',
          as: 'recipes'
        }
      },
      {
        $match: {
          'recipes.0': { $exists: true }
        }
      },
      {
        $addFields: {
          recipeCount: { $size: '$recipes' }
        }
      },
      {
        $sort: { recipeCount: -1 }
      },
      {
        $limit: 10
      },
      {
        $project: {
          username: 1,
          firstName: 1,
          lastName: 1,
          avatar: 1,
          bio: 1,
          recipeCount: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: topChefs
    });
  } catch (error) {
    console.error('Get top chefs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching top chefs'
    });
  }
});

module.exports = router; 
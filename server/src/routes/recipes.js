/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express');
const { body, validationResult, query } = require('express-validator');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recipes
// @desc    Get all recipes with filtering and search
// @access  Public
router.get('/', [
  query('search').optional().isString(),
  query('category').optional().isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other']),
  query('cuisine').optional().isString(),
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
  query('maxTime').optional().isInt({ min: 1 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating', 'time', 'title', 'popular']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      search,
      category,
      cuisine,
      difficulty,
      maxTime,
      minRating,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isPublic: true };
    
    if (category) query.category = category;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'ingredients.name': { $regex: search, $options: 'i' } }
      ];
    }
    if (maxTime) {
      query.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, parseInt(maxTime)] };
    }
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'rating':
        sortObject = { averageRating: -1 };
        break;
      case 'time':
        sortObject = { prepTime: 1 };
        break;
      case 'title':
        sortObject = { title: 1 };
        break;
      case 'popular':
        sortObject = { 'likes.length': -1, averageRating: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const recipes = await Recipe.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: recipes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecipes: total,
        hasNext: skip + recipes.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recipes'
    });
  }
});

// @route   GET /api/recipes/featured
// @desc    Get featured recipes
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const recipes = await Recipe.find({ isPublic: true, isFeatured: true })
      .populate('author', 'username firstName lastName avatar')
      .sort({ averageRating: -1 })
      .limit(6);

    res.json({
      success: true,
      data: recipes
    });
  } catch (error) {
    console.error('Get featured recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured recipes'
    });
  }
});

// @route   GET /api/recipes/search
// @desc    Search recipes with advanced filtering
// @access  Public
router.get('/search', [
  query('q').optional().isString(),
  query('category').optional().isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other']),
  query('cuisine').optional().isString(),
  query('difficulty').optional().isIn(['Easy', 'Medium', 'Hard']),
  query('maxTime').optional().isInt({ min: 1 }),
  query('minRating').optional().isFloat({ min: 0, max: 5 }),
  query('sortBy').optional().isIn(['newest', 'oldest', 'rating', 'time', 'title', 'popular']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const {
      q: searchQuery,
      category,
      cuisine,
      difficulty,
      maxTime,
      minRating,
      sortBy = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    const query = { isPublic: true };
    
    if (category) query.category = category;
    if (cuisine) query.cuisine = { $regex: cuisine, $options: 'i' };
    if (difficulty) query.difficulty = difficulty;
    if (searchQuery) {
      query.$or = [
        { title: { $regex: searchQuery, $options: 'i' } },
        { description: { $regex: searchQuery, $options: 'i' } },
        { 'ingredients.name': { $regex: searchQuery, $options: 'i' } }
      ];
    }
    if (maxTime) {
      query.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, parseInt(maxTime)] };
    }
    if (minRating) {
      query.averageRating = { $gte: parseFloat(minRating) };
    }

    // Build sort object
    let sortObject = {};
    switch (sortBy) {
      case 'newest':
        sortObject = { createdAt: -1 };
        break;
      case 'oldest':
        sortObject = { createdAt: 1 };
        break;
      case 'rating':
        sortObject = { averageRating: -1 };
        break;
      case 'time':
        sortObject = { prepTime: 1 };
        break;
      case 'title':
        sortObject = { title: 1 };
        break;
      case 'popular':
        sortObject = { 'likes.length': -1, averageRating: -1 };
        break;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const recipes = await Recipe.find(query)
      .populate('author', 'username firstName lastName avatar')
      .sort(sortObject)
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const total = await Recipe.countDocuments(query);

    res.json({
      success: true,
      data: recipes,
      total,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalRecipes: total,
        hasNext: skip + recipes.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Search recipes error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching recipes'
    });
  }
});

// @route   GET /api/recipes/:id
// @desc    Get single recipe by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar bio')
      .populate('reviews.user', 'username firstName lastName avatar');

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    if (!recipe.isPublic && (!req.user || req.user._id.toString() !== recipe.author._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: recipe
    });
  } catch (error) {
    console.error('Get recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recipe'
    });
  }
});

// @route   POST /api/recipes
// @desc    Create a new recipe
// @access  Private
router.post('/', auth, [
  body('title')
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('prepTime')
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute'),
  body('cookTime')
    .isInt({ min: 0 })
    .withMessage('Cooking time cannot be negative'),
  body('servings')
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('difficulty')
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('cuisine')
    .notEmpty()
    .withMessage('Cuisine is required'),
  body('category')
    .isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other'])
    .withMessage('Invalid category'),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient is required'),
  body('ingredients.*.name')
    .notEmpty()
    .withMessage('Ingredient name is required'),
  body('ingredients.*.amount')
    .notEmpty()
    .withMessage('Ingredient amount is required'),
  body('instructions')
    .isArray({ min: 1 })
    .withMessage('At least one instruction is required'),
  body('instructions.*.description')
    .notEmpty()
    .withMessage('Instruction description is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const recipeData = {
      ...req.body,
      author: req.user._id
    };

    const recipe = new Recipe(recipeData);
    await recipe.save();

    // Add to user's recipes
    await User.findByIdAndUpdate(req.user._id, {
      $push: { myRecipes: recipe._id }
    });

    const populatedRecipe = await Recipe.findById(recipe._id)
      .populate('author', 'username firstName lastName avatar');

    res.status(201).json({
      success: true,
      message: 'Recipe created successfully',
      data: populatedRecipe
    });
  } catch (error) {
    console.error('Create recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating recipe'
    });
  }
});

// @route   PUT /api/recipes/:id
// @desc    Update a recipe
// @access  Private
router.put('/:id', auth, [
  body('title')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('description')
    .optional()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Description must be between 1 and 1000 characters'),
  body('prepTime')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Preparation time must be at least 1 minute'),
  body('cookTime')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Cooking time cannot be negative'),
  body('servings')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Servings must be at least 1'),
  body('difficulty')
    .optional()
    .isIn(['Easy', 'Medium', 'Hard'])
    .withMessage('Difficulty must be Easy, Medium, or Hard'),
  body('cuisine')
    .optional()
    .notEmpty()
    .withMessage('Cuisine cannot be empty'),
  body('category')
    .optional()
    .isIn(['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other'])
    .withMessage('Invalid category')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check ownership or admin status
    if (recipe.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own recipes.'
      });
    }

    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Recipe updated successfully',
      data: updatedRecipe
    });
  } catch (error) {
    console.error('Update recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating recipe'
    });
  }
});

// @route   DELETE /api/recipes/:id
// @desc    Delete a recipe
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    // Check ownership or admin status
    if (recipe.author.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own recipes.'
      });
    }

    await Recipe.findByIdAndDelete(req.params.id);

    // Remove from user's recipes
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { myRecipes: req.params.id }
    });

    res.json({
      success: true,
      message: 'Recipe deleted successfully'
    });
  } catch (error) {
    console.error('Delete recipe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting recipe'
    });
  }
});

// @route   POST /api/recipes/:id/reviews
// @desc    Add a review to a recipe
// @access  Private
router.post('/:id/reviews', auth, [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await recipe.addReview(req.user._id, rating, comment);

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar')
      .populate('reviews.user', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Review added successfully',
      data: updatedRecipe
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding review'
    });
  }
});

// @route   POST /api/recipes/:id/like
// @desc    Toggle like on a recipe
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    await recipe.toggleLike(req.user._id);

    const updatedRecipe = await Recipe.findById(req.params.id)
      .populate('author', 'username firstName lastName avatar');

    res.json({
      success: true,
      message: 'Like toggled successfully',
      data: updatedRecipe
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling like'
    });
  }
});

// @route   POST /api/recipes/:id/favorite
// @desc    Toggle favorite recipe
// @access  Private
router.post('/:id/favorite', auth, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: 'Recipe not found'
      });
    }

    const user = await User.findById(req.user._id);
    const isFavorite = user.favoriteRecipes.includes(req.params.id);

    if (isFavorite) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { favoriteRecipes: req.params.id }
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        $push: { favoriteRecipes: req.params.id }
      });
    }

    res.json({
      success: true,
      message: isFavorite ? 'Recipe removed from favorites' : 'Recipe added to favorites',
      isFavorite: !isFavorite
    });
  } catch (error) {
    console.error('Toggle favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling favorite'
    });
  }
});

module.exports = router; 
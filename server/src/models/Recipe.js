/* eslint-disable @typescript-eslint/no-require-imports */
const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    default: ''
  },
  amount: {
    type: String,
    trim: true,
    default: ''
  },
  unit: {
    type: String,
    trim: true,
    default: ''
  }
});

const instructionSchema = new mongoose.Schema({
  step: {
    type: Number,
    default: 1
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  comment: {
    type: String,
    trim: true,
    maxlength: [500, 'Comment cannot exceed 500 characters']
  }
}, {
  timestamps: true
});

const recipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Recipe title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Recipe description is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  prepTime: {
    type: Number,
    default: 0,
    min: [0, 'Preparation time cannot be negative']
  },
  cookTime: {
    type: Number,
    default: 0,
    min: [0, 'Cooking time cannot be negative']
  },
  servings: {
    type: Number,
    default: 1,
    min: [0, 'Servings cannot be negative']
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  cuisine: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    required: [true, 'Recipe category is required'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread', 'Other']
  },
  ingredients: {
    type: [ingredientSchema],
    default: []
  },
  instructions: {
    type: [instructionSchema],
    default: []
  },
  tags: [{
    type: String,
    trim: true
  }],
  reviews: [reviewSchema],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPublic: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
recipeSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  cuisine: 'text'
});

// Calculate average rating when reviews are added/updated
recipeSchema.pre('save', function(next) {
  if (this.reviews && this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.averageRating = totalRating / this.reviews.length;
    this.totalReviews = this.reviews.length;
  } else {
    this.averageRating = 0;
    this.totalReviews = 0;
  }
  next();
});

// Virtual for total time
recipeSchema.virtual('totalTime').get(function() {
  return this.prepTime + this.cookTime;
});

// Method to add review
recipeSchema.methods.addReview = function(userId, rating, comment) {
  // Remove existing review by this user
  this.reviews = this.reviews.filter(review => review.user.toString() !== userId.toString());
  
  // Add new review
  this.reviews.push({
    user: userId,
    rating,
    comment
  });
  
  return this.save();
};

// Method to toggle like
recipeSchema.methods.toggleLike = function(userId) {
  const likeIndex = this.likes.indexOf(userId);
  
  if (likeIndex === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(likeIndex, 1);
  }
  
  return this.save();
};

// Static method to get recipes with filters
recipeSchema.statics.getFilteredRecipes = function(filters = {}) {
  const query = { isPublic: true };
  
  if (filters.category) query.category = filters.category;
  if (filters.cuisine) query.cuisine = filters.cuisine;
  if (filters.difficulty) query.difficulty = filters.difficulty;
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  if (filters.maxTime) {
    query.$expr = { $lte: [{ $add: ['$prepTime', '$cookTime'] }, filters.maxTime] };
  }
  
  return this.find(query)
    .populate('author', 'username firstName lastName avatar')
    .sort(filters.sortBy || { createdAt: -1 });
};

module.exports = mongoose.model('Recipe', recipeSchema); 
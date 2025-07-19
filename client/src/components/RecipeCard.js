import React from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaStar, FaHeart } from 'react-icons/fa';

const RecipeCard = ({ recipe }) => {
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy':
        return 'difficulty-easy';
      case 'Medium':
        return 'difficulty-medium';
      case 'Hard':
        return 'difficulty-hard';
      default:
        return 'difficulty-medium';
    }
  };

  return (
    <Link
      to={`/recipe/${recipe._id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden recipe-card"
    >
      {/* Recipe Image */}
      <div className="relative h-48 bg-gray-200">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="category-badge">
            {recipe.category}
          </span>
        </div>
        
        {/* Difficulty Badge */}
        <div className="absolute top-3 right-3">
          <span className={`difficulty-badge ${getDifficultyColor(recipe.difficulty)}`}>
            {recipe.difficulty}
          </span>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
          {recipe.title}
        </h3>
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {recipe.description}
        </p>
        
        {/* Author */}
        <div className="flex items-center mb-3">
          <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
            <span className="text-white text-xs font-medium">
              {recipe.author?.firstName?.charAt(0) || recipe.author?.username?.charAt(0) || 'U'}
            </span>
          </div>
          <span className="text-sm text-gray-600">
            {recipe.author?.firstName} {recipe.author?.lastName}
          </span>
        </div>
        
        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center">
            <FaClock className="mr-1" />
            <span>{formatTime(recipe.prepTime + recipe.cookTime)}</span>
          </div>
          
          <div className="flex items-center">
            <FaStar className="mr-1 text-yellow-400" />
            <span>{recipe.averageRating?.toFixed(1) || '0.0'}</span>
            <span className="ml-1">({recipe.totalReviews || 0})</span>
          </div>
        </div>
        
        {/* Likes */}
        {recipe.likes && (
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <FaHeart className="mr-1 text-red-400" />
            <span>{recipe.likes.length} likes</span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default RecipeCard; 
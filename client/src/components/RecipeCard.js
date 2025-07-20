import React from 'react';
import { Link } from 'react-router-dom';
import { FaClock, FaStar, FaHeart } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const RecipeCard = ({ recipe, onFavorite }) => {
  const { isAuthenticated } = useAuth();

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    if (minutes < 60) return `${minutes} min`;
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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAuthorName = () => {
    if (!recipe.author) return 'Unknown Author';
    const { firstName, lastName } = recipe.author;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    if (firstName) return firstName;
    if (recipe.author.username) return recipe.author.username;
    return 'Unknown Author';
  };

  const getAuthorInitial = () => {
    if (!recipe.author) return 'U';
    const { firstName, username } = recipe.author;
    if (firstName) return firstName.charAt(0);
    if (username) return username.charAt(0);
    return 'U';
  };

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const cookingTime = recipe.cookingTime || totalTime;

  return (
    <div className="block bg-white rounded-lg shadow-md overflow-hidden recipe-card">
      <Link to={`/recipe/${recipe._id}`}>
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
                {getAuthorInitial()}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {getAuthorName()}
            </span>
          </div>
          
          {/* Recipe Stats */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center">
              <FaClock className="mr-1" />
              <span>{formatTime(cookingTime)}</span>
            </div>
            
            <div className="flex items-center">
              <FaStar className="mr-1 text-yellow-400" />
              <span>{recipe.averageRating?.toFixed(1) || '0.0'}</span>
              <span className="ml-1">({recipe.totalReviews || 0})</span>
            </div>
          </div>

          {/* Servings */}
          <div className="text-sm text-gray-500 mt-1">
            {recipe.servings ? `${recipe.servings} servings` : 'N/A servings'}
          </div>

          {/* Date */}
          {recipe.createdAt && (
            <div className="text-sm text-gray-500 mt-1">
              {formatDate(recipe.createdAt)}
            </div>
          )}
        </div>
      </Link>

      {/* Favorite Button */}
      {isAuthenticated && onFavorite && (
        <div className="p-4 pt-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              onFavorite(recipe._id);
            }}
            className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
            aria-label="favorite"
          >
            <FaHeart className="inline mr-2" />
            Favorite
          </button>
        </div>
      )}
    </div>
  );
};

export default RecipeCard; 
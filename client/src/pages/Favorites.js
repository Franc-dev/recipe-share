import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaHeart, FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');

  // Fetch user's favorite recipes
  const { data: favorites, isLoading, error } = useQuery(
    ['favorites', user?._id],
    async () => {
      const response = await api.get('/api/users/favorites');
      return response.data.data;
    },
    {
      enabled: !!user,
    }
  );

  // Remove from favorites mutation
  const removeFavoriteMutation = useMutation(
    async (recipeId) => {
      await api.post(`/api/recipes/${recipeId}/favorite`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['favorites']);
        toast.success('Removed from favorites');
      },
      onError: () => {
        toast.error('Failed to remove from favorites');
      }
    }
  );

  const handleRemoveFavorite = (recipeId, recipeTitle) => {
    if (window.confirm(`Remove "${recipeTitle}" from favorites?`)) {
      removeFavoriteMutation.mutate(recipeId);
    }
  };

  // Filter favorites based on search and filters
  const filteredFavorites = favorites?.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    const matchesCuisine = !selectedCuisine || recipe.cuisine === selectedCuisine;
    
    return matchesSearch && matchesCategory && matchesCuisine;
  }) || [];

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 
    'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread'
  ];

  const cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'French', 'American', 'Mediterranean', 'Greek', 'Spanish', 'Korean'
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Favorite Recipes</h1>
            <p className="text-gray-600 mb-8">
              Please log in to view your favorite recipes.
            </p>
            <Link
              to="/login"
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12">Error loading favorites</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Favorite Recipes</h1>
          <p className="text-gray-600">
            Your saved recipes and culinary inspirations
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-full">
                <FaHeart className="text-red-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Favorites</p>
                <p className="text-2xl font-bold text-gray-800">{favorites?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaHeart className="text-orange-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(favorites?.map(r => r.category)).size || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaHeart className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cuisines</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(favorites?.map(r => r.cuisine).filter(Boolean)).size || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaHeart className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Average Rating</p>
                <p className="text-2xl font-bold text-gray-800">
                  {favorites?.length > 0 
                    ? (favorites.reduce((sum, r) => sum + (r.averageRating || 0), 0) / favorites.length).toFixed(1)
                    : '0.0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Cuisine Filter */}
            <div>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((recipe) => (
              <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                {/* Recipe Image */}
                <div className="relative h-48">
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
                  
                  {/* Favorite Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                      ❤️ Favorite
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link
                      to={`/recipe/${recipe._id}`}
                      className="p-2 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      title="View Recipe"
                    >
                      👁️
                    </Link>
                    <button
                      onClick={() => handleRemoveFavorite(recipe._id, recipe.title)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Remove from Favorites"
                    >
                      <FaTrash className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Recipe Info */}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  {/* Author Info */}
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center mr-2">
                      <span className="text-white text-xs font-bold">
                        {recipe.author.firstName?.charAt(0) || recipe.author.username?.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      by {recipe.author.firstName} {recipe.author.lastName}
                    </span>
                  </div>
                  
                  {/* Recipe Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>⏱️ {recipe.prepTime + recipe.cookTime} min</span>
                    <span>👥 {recipe.servings} servings</span>
                    <span>⭐ {recipe.averageRating?.toFixed(1) || '0.0'}</span>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      {recipe.category}
                    </span>
                    {recipe.cuisine && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {recipe.cuisine}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {recipe.difficulty}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>❤️ {recipe.likes?.length || 0} likes</span>
                    <span>👁️ {recipe.views || 0} views</span>
                    <span>💬 {recipe.reviews?.length || 0} reviews</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {favorites?.length === 0 ? 'No favorites yet' : 'No favorites found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {favorites?.length === 0 
                ? 'Start exploring recipes and add them to your favorites!'
                : 'Try adjusting your search or filters to find what you\'re looking for.'
              }
            </p>
            {favorites?.length === 0 && (
              <Link
                to="/"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Explore Recipes
              </Link>
            )}
          </div>
        )}

        {/* Quick Actions */}
        {filteredFavorites.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                🔍 Explore More Recipes
              </Link>
              <Link
                to="/my-recipes"
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                👨‍🍳 My Recipes
              </Link>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('');
                  setSelectedCuisine('');
                }}
                className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <FaFilter className="mr-2" />
                Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites; 
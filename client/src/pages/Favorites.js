import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApi, useMutation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaHeart, FaSearch, FaFilter, FaTrash } from 'react-icons/fa';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { user, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [removeLoading, setRemoveLoading] = useState(false);

  // Fetch user's favorite recipes
  const { data: favorites, loading, error, refetch } = useApi(
    '/api/users/favorites',
    {
      enabled: !!user,
    }
  );

  const handleRemoveFavorite = async (recipeId, recipeTitle) => {
    if (window.confirm(`Remove "${recipeTitle}" from favorites?`)) {
      try {
        setRemoveLoading(true);
        await api.post(`/api/recipes/${recipeId}/favorite`);
        refetch();
        toast.success('Removed from favorites');
      } catch (error) {
        toast.error('Failed to remove from favorites');
      } finally {
        setRemoveLoading(false);
      }
    }
  };

  // Filter favorites
  const filteredFavorites = favorites?.data?.filter(recipe => {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Favorites</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Favorites</h1>
          <p className="text-gray-600">
            Your saved recipes ({filteredFavorites.length} favorites)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            {filteredFavorites.map(recipe => (
              <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <RecipeCard recipe={recipe} />
                
                {/* Remove Button */}
                <div className="p-4 border-t border-gray-200">
                  <button
                    onClick={() => handleRemoveFavorite(recipe._id, recipe.title)}
                    disabled={removeLoading}
                    className="w-full flex items-center justify-center text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    <FaTrash className="mr-1" />
                    Remove from Favorites
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">
              <FaHeart />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchQuery || selectedCategory || selectedCuisine
                ? 'No favorites match your filters'
                : 'No favorites yet'
              }
            </h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory || selectedCuisine
                ? 'Try adjusting your search terms or filters'
                : "Start exploring recipes and save your favorites!"
              }
            </p>
            {!searchQuery && !selectedCategory && !selectedCuisine && (
              <Link
                to="/"
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FaHeart className="mr-2" />
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
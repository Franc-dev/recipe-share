import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyRecipes = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch user's recipes
  const { data: recipes, isLoading, error } = useQuery(
    ['myRecipes', user?._id],
    async () => {
      const response = await api.get('/api/users/my-recipes');
      return response.data.data;
    },
    {
      enabled: !!user,
    }
  );

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation(
    async (recipeId) => {
      await api.delete(`/api/recipes/${recipeId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['myRecipes']);
        toast.success('Recipe deleted successfully!');
      },
      onError: () => {
        toast.error('Failed to delete recipe');
      }
    }
  );

  const handleDelete = (recipeId, recipeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      deleteRecipeMutation.mutate(recipeId);
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  const handleView = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  // Filter recipes based on search and filters
  const filteredRecipes = recipes?.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || recipe.category === selectedCategory;
    
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'public' && recipe.isPublic) ||
                         (selectedStatus === 'private' && !recipe.isPublic);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }) || [];

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 
    'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread'
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">My Recipes</h1>
            <p className="text-gray-600 mb-8">
              Please log in to view and manage your recipes.
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
  if (error) return <div className="text-center py-12">Error loading recipes</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Recipes</h1>
            <p className="text-gray-600">
              Manage and organize your culinary creations
            </p>
          </div>
          <Link
            to="/create-recipe"
            className="flex items-center bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors mt-4 md:mt-0"
          >
            <FaPlus className="mr-2" />
            Create New Recipe
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaEye className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                <p className="text-2xl font-bold text-gray-800">{recipes?.length || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaEye className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Public</p>
                <p className="text-2xl font-bold text-gray-800">
                  {recipes?.filter(r => r.isPublic).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaEye className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Private</p>
                <p className="text-2xl font-bold text-gray-800">
                  {recipes?.filter(r => !r.isPublic).length || 0}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaEye className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-800">
                  {recipes?.reduce((sum, r) => sum + (r.views || 0), 0) || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search your recipes..."
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

            {/* Status Filter */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="all">All Recipes</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Recipes Grid */}
        {filteredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRecipes.map((recipe) => (
              <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden">
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
                  
                  {/* Status Badge */}
                  <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      recipe.isPublic 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {recipe.isPublic ? 'Public' : 'Private'}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-2 right-2 flex space-x-1">
                    <button
                      onClick={() => handleView(recipe._id)}
                      className="p-2 bg-white text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
                      title="View Recipe"
                    >
                      <FaEye className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleEdit(recipe._id)}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                      title="Edit Recipe"
                    >
                      <FaEdit className="text-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(recipe._id, recipe.title)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Delete Recipe"
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
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {recipes?.length === 0 ? 'No recipes yet' : 'No recipes found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {recipes?.length === 0 
                ? 'Start creating your first recipe to share with the world!'
                : 'Try adjusting your search or filters to find what you\'re looking for.'
              }
            </p>
            {recipes?.length === 0 && (
              <Link
                to="/create-recipe"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Create Your First Recipe
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRecipes; 
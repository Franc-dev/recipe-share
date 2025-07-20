import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaSearch } from 'react-icons/fa';
import toast from 'react-hot-toast';

const MyRecipes = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch user's recipes
  const { data: recipes, loading, error, refetch } = useApi(
    '/api/users/my-recipes',
    {
      enabled: !!user,
    }
  );

  // Delete recipe mutation
  const deleteRecipeMutation = useMutation(
    '/api/recipes',
    {
      method: 'DELETE',
      onSuccess: () => {
        refetch();
        toast.success('Recipe deleted successfully!');
      },
      onError: () => {
        toast.error('Failed to delete recipe');
      }
    }
  );

  const handleDelete = async (recipeId, recipeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${recipeTitle}"?`)) {
      try {
        setDeleteLoading(true);
        await api.delete(`/api/recipes/${recipeId}`);
        refetch();
        toast.success('Recipe deleted successfully!');
      } catch (error) {
        toast.error('Failed to delete recipe');
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  const handleEdit = (recipeId) => {
    navigate(`/edit-recipe/${recipeId}`);
  };

  const handleView = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  // Filter recipes
  const filteredRecipes = recipes?.data?.filter(recipe => {
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Recipes</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">My Recipes</h1>
          <p className="text-gray-600">
            Manage your culinary creations ({filteredRecipes.length} recipes)
          </p>
        </div>
        <Link
          to="/create-recipe"
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mt-4 md:mt-0"
        >
          <FaPlus className="mr-2" />
          Create Recipe
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.map(recipe => (
            <div key={recipe._id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <RecipeCard recipe={recipe} />
              
              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => handleView(recipe._id)}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FaEye className="mr-1" />
                    View
                  </button>
                  
                  <button
                    onClick={() => handleEdit(recipe._id)}
                    className="flex items-center text-green-600 hover:text-green-800 text-sm"
                  >
                    <FaEdit className="mr-1" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDelete(recipe._id, recipe.title)}
                    disabled={deleteLoading}
                    className="flex items-center text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                  >
                    <FaTrash className="mr-1" />
                    Delete
                  </button>
                </div>
                
                {/* Status Badge */}
                <div className="mt-2">
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    recipe.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {recipe.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <FaPlus />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchQuery || selectedCategory || selectedStatus !== 'all' 
              ? 'No recipes match your filters'
              : 'No recipes yet'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery || selectedCategory || selectedStatus !== 'all'
              ? 'Try adjusting your search terms or filters'
              : "Start sharing your culinary creations with the world!"
            }
          </p>
          {!searchQuery && !selectedCategory && selectedStatus === 'all' && (
            <Link
              to="/create-recipe"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Create Your First Recipe
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export default MyRecipes; 
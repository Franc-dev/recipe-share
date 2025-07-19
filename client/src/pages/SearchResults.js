import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSearch, FaFilter, FaSort, FaTimes, FaStar, FaClock, FaHeart } from 'react-icons/fa';

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    cuisine: searchParams.get('cuisine') || '',
    difficulty: searchParams.get('difficulty') || '',
    maxTime: searchParams.get('maxTime') || '',
    minRating: searchParams.get('minRating') || '',
    sortBy: searchParams.get('sortBy') || 'newest'
  });

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  const limit = 12;

  // Fetch search results
  const { data: searchResults, isLoading, error } = useQuery(
    ['search', query, filters, page],
    async () => {
      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: limit.toString(),
        ...filters
      });
      
      const response = await api.get(`/api/recipes?${params}`);
      return response.data;
    },
    {
      enabled: !!query || !!filters.category || !!filters.cuisine,
      keepPreviousData: true
    }
  );

  // Update URL when filters change
  useEffect(() => {
    const newParams = new URLSearchParams();
    if (query) newParams.set('q', query);
    if (page > 1) newParams.set('page', page.toString());
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams.set(key, value);
    });
    
    setSearchParams(newParams);
  }, [filters, page, query, setSearchParams]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      cuisine: '',
      difficulty: '',
      maxTime: '',
      minRating: '',
      sortBy: 'newest'
    });
  };

  const handlePageChange = (newPage) => {
    window.scrollTo(0, 0);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      newParams.set('page', newPage.toString());
      return newParams;
    });
  };

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 
    'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread'
  ];

  const cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'French', 'American', 'Mediterranean', 'Greek', 'Spanish', 'Korean'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'time', label: 'Quickest' },
    { value: 'title', label: 'Alphabetical' },
    { value: 'popular', label: 'Most Popular' }
  ];

  const totalPages = Math.ceil((searchResults?.total || 0) / limit);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {query ? `Search Results for "${query}"` : 'Browse Recipes'}
          </h1>
          <p className="text-gray-600">
            {searchResults?.total ? `${searchResults.total} recipes found` : 'No recipes found'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search recipes, ingredients, or cuisines..."
                value={query}
                onChange={(e) => {
                  const newParams = new URLSearchParams(searchParams);
                  if (e.target.value) {
                    newParams.set('q', e.target.value);
                  } else {
                    newParams.delete('q');
                  }
                  newParams.delete('page');
                  setSearchParams(newParams);
                }}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <FaTimes className="mr-2" />
              Clear All
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center mb-4">
            <FaFilter className="mr-2 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cuisine
              </label>
              <select
                value={filters.cuisine}
                onChange={(e) => handleFilterChange('cuisine', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">All Cuisines</option>
                {cuisines.map(cuisine => (
                  <option key={cuisine} value={cuisine}>{cuisine}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty}
                onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>{difficulty}</option>
                ))}
              </select>
            </div>

            {/* Max Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Time (min)
              </label>
              <select
                value={filters.maxTime}
                onChange={(e) => handleFilterChange('maxTime', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Time</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2+ hours</option>
              </select>
            </div>

            {/* Min Rating Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Rating
              </label>
              <select
                value={filters.minRating}
                onChange={(e) => handleFilterChange('minRating', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ stars</option>
                <option value="3">3+ stars</option>
                <option value="2">2+ stars</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters */}
          {Object.values(filters).some(value => value && value !== 'newest') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center flex-wrap gap-2">
                <span className="text-sm text-gray-600">Active filters:</span>
                {Object.entries(filters).map(([key, value]) => {
                  if (!value || value === 'newest') return null;
                  return (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
                    >
                      {key}: {value}
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="ml-2 text-orange-600 hover:text-orange-800"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Error loading search results</p>
          </div>
        ) : searchResults?.data?.length > 0 ? (
          <>
            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {searchResults.data.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 rounded-lg ${
                        pageNum === page
                          ? 'bg-orange-500 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}

            {/* Results Summary */}
            <div className="mt-8 text-center text-gray-600">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, searchResults.total)} of {searchResults.total} recipes
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find what you're looking for.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearFilters}
                className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
              >
                Clear Filters
              </button>
              <Link
                to="/"
                className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Browse All Recipes
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        {searchResults?.data?.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/"
                className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                🏠 Back to Home
              </Link>
              <Link
                to="/create-recipe"
                className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                ➕ Create Recipe
              </Link>
              <Link
                to="/favorites"
                className="flex items-center px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                ❤️ My Favorites
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults; 
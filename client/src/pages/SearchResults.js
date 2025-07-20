import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApi } from '../hooks/useApi';
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

  // Build query parameters
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    
    // Only add search if it's not empty
    if (query && query.trim()) {
      params.set('search', query);
    }
    
    params.set('page', page.toString());
    params.set('limit', limit.toString());
    
    // Only add non-empty filter values
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value);
      }
    });
    
    return params.toString();
  };

  // Fetch search results using custom hook
  const { data: searchResults, loading, error } = useApi(
    `/api/recipes?${buildQueryParams()}`,
    {
      enabled: !!query || !!filters.category || !!filters.cuisine,
      dependencies: [query, filters, page]
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Search Results</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Search Results
          {query && (
            <span className="text-gray-600 font-normal">
              {' '}for "{query}"
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Found {searchResults?.total || 0} recipes
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Filters</h2>
          <button
            onClick={clearFilters}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
          >
            <FaTimes className="mr-1" />
            Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cuisine
            </label>
            <select
              value={filters.cuisine}
              onChange={(e) => handleFilterChange('cuisine', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
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
            <input
              type="number"
              value={filters.maxTime}
              onChange={(e) => handleFilterChange('maxTime', e.target.value)}
              placeholder="Any time"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Rating Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Rating
            </label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any Rating</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {searchResults?.data && searchResults.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {searchResults.data.map(recipe => (
              <RecipeCard key={recipe._id} recipe={recipe} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-4 py-2 text-gray-700">
                Page {page} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">
            <FaSearch />
          </div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No recipes found
          </h3>
          <p className="text-gray-500 mb-6">
            Try adjusting your search terms or filters
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <FaSearch className="mr-2" />
            Browse All Recipes
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults; 
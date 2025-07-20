import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [recentRecipes, setRecentRecipes] = useState([]);
  const [topChefs, setTopChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 
    'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread'
  ];

  // Simple fetch function
  const fetchData = async (endpoint) => {
    try {
      console.log(`🚀 Fetching: ${endpoint}`);
      const response = await fetch(`http://localhost:5000${endpoint}`);
      const data = await response.json();
      console.log(`✅ Success: ${endpoint}`);
      return data;
    } catch (err) {
      console.error(`❌ Error: ${endpoint}`, err.message);
      throw err;
    }
  };

  // Load all data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [featured, recent, chefs] = await Promise.all([
          fetchData('/api/recipes/featured'),
          fetchData('/api/recipes?sortBy=newest&limit=8'),
          fetchData('/api/users/top-chefs')
        ]);

        setFeaturedRecipes(featured.data || []);
        setRecentRecipes(recent.data || []);
        setTopChefs(chefs.data || []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    window.location.href = `/search?category=${encodeURIComponent(category)}`;
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Unable to load recipes. Please try again later.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Discover Amazing Recipes
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-orange-100">
              Share your culinary creations and explore recipes from around the world
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for recipes, ingredients, or cuisines..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg text-gray-800 rounded-lg focus:outline-none focus:ring-4 focus:ring-orange-300"
                />
                <button
                  type="submit"
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FaSearch className="text-xl" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 text-center"
              >
                <div className="text-2xl mb-2">🍽️</div>
                <span className="font-medium text-gray-800">{category}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Featured Recipes
            </h2>
            <Link
              to="/search?sortBy=rating"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {featuredRecipes && featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No featured recipes yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Recipes Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Latest Recipes
            </h2>
            <Link
              to="/search?sortBy=newest"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              View All →
            </Link>
          </div>
          
          {recentRecipes && recentRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {recentRecipes.map((recipe) => (
                <RecipeCard key={recipe._id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No recipes yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* Top Chefs Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">
            Top Chefs
          </h2>
          
          {topChefs && topChefs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {topChefs.map((chef) => (
                <Link
                  key={chef._id}
                  to={`/user/${chef.username}`}
                  className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {chef.firstName?.charAt(0) || chef.username?.charAt(0)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-1">
                    {chef.firstName} {chef.lastName}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">@{chef.username}</p>
                  <p className="text-orange-500 font-medium">
                    {chef.recipeCount} recipes
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No chefs yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 
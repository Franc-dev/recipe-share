import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi, useMutation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaClock, FaStar, FaHeart, FaUser, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch recipe details
  const { data: recipe, loading, error, refetch } = useApi(
    `/api/recipes/${id}`,
    { enabled: !!id }
  );

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to like recipes');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/api/recipes/${id}/like`);
      refetch();
      toast.success('Recipe liked!');
    } catch (error) {
      toast.error('Failed to like recipe');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to favorite recipes');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/api/recipes/${id}/favorite`);
      refetch();
      toast.success('Recipe added to favorites!');
    } catch (error) {
      toast.error('Failed to add to favorites');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to add reviews');
      return;
    }
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    try {
      setActionLoading(true);
      await api.post(`/api/recipes/${id}/reviews`, { rating, comment });
      refetch();
      setRating(0);
      setComment('');
      toast.success('Review added successfully!');
    } catch (error) {
      toast.error('Failed to add review');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        setActionLoading(true);
        await api.delete(`/api/recipes/${id}`);
        toast.success('Recipe deleted successfully!');
        navigate('/my-recipes');
      } catch (error) {
        toast.error('Failed to delete recipe');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Recipe</h2>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  if (!recipe?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Recipe Not Found</h2>
          <p className="text-gray-600">The recipe you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const recipeData = recipe.data;
  const isAuthor = user && recipeData.author._id === user._id;
  const isLiked = user && recipeData.likes?.includes(user._id);
  const isFavorited = user && recipeData.favorites?.includes(user._id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>

      {/* Recipe Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        {/* Recipe Image */}
        <div className="relative h-64 md:h-96">
          {recipeData.image ? (
            <img
              src={recipeData.image}
              alt={recipeData.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="absolute top-4 right-4 flex space-x-2">
            {isAuthor && (
              <>
                <button
                  onClick={() => navigate(`/edit-recipe/${id}`)}
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                  title="Edit Recipe"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors disabled:opacity-50"
                  title="Delete Recipe"
                >
                  <FaTrash />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recipe Info */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {recipeData.title}
              </h1>
              <p className="text-gray-600 mb-4">
                {recipeData.description}
              </p>
              
              {/* Author Info */}
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">
                    {recipeData.author.firstName?.charAt(0) || recipeData.author.username?.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    by{' '}
                    <a
                      href={`/user/${recipeData.author.username}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {recipeData.author.firstName} {recipeData.author.lastName}
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(recipeData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-2 mt-4 md:mt-0">
              <button
                onClick={handleLike}
                disabled={actionLoading}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isLiked
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                <FaHeart className="mr-2" />
                {isLiked ? 'Liked' : 'Like'} ({recipeData.likes?.length || 0})
              </button>
              
              <button
                onClick={handleFavorite}
                disabled={actionLoading}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  isFavorited
                    ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                } disabled:opacity-50`}
              >
                <FaStar className="mr-2" />
                {isFavorited ? 'Favorited' : 'Favorite'}
              </button>
            </div>
          </div>

          {/* Recipe Meta */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FaClock className="text-blue-500 mr-1" />
              </div>
              <p className="text-sm text-gray-600">Prep Time</p>
              <p className="font-semibold">{recipeData.prepTime} min</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FaClock className="text-green-500 mr-1" />
              </div>
              <p className="text-sm text-gray-600">Cook Time</p>
              <p className="font-semibold">{recipeData.cookTime} min</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FaUser className="text-purple-500 mr-1" />
              </div>
              <p className="text-sm text-gray-600">Servings</p>
              <p className="font-semibold">{recipeData.servings}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-1">
                <FaStar className="text-yellow-500 mr-1" />
              </div>
              <p className="text-sm text-gray-600">Rating</p>
              <p className="font-semibold">{recipeData.averageRating?.toFixed(1) || '0.0'}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {recipeData.category}
            </span>
            {recipeData.cuisine && (
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {recipeData.cuisine}
              </span>
            )}
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
              {recipeData.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ingredients */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Ingredients</h2>
          <ul className="space-y-2">
            {recipeData.ingredients?.map((ingredient, index) => (
              <li key={index} className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                <span className="text-gray-700">
                  {ingredient.amount} {ingredient.unit} {ingredient.name}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Instructions</h2>
          <ol className="space-y-4">
            {recipeData.instructions?.map((instruction, index) => (
              <li key={index} className="flex">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                  {instruction.step || index + 1}
                </span>
                <span className="text-gray-700">{instruction.description}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">Reviews</h2>
        
        {/* Add Review Form */}
        {isAuthenticated && (
          <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center mb-4">
              <label className="text-sm font-medium text-gray-700 mr-4">Rating:</label>
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300'
                    } hover:text-yellow-500 transition-colors`}
                  >
                    <FaStar />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comment (optional):
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Share your thoughts about this recipe..."
              />
            </div>
            
            <button
              type="submit"
              disabled={actionLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {recipeData.reviews?.length > 0 ? (
            recipeData.reviews.map((review, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {review.user.firstName?.charAt(0) || review.user.username?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <FaStar
                        key={i}
                        className={`text-sm ${
                          i < review.rating ? 'text-yellow-500' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-gray-700 ml-11">{review.comment}</p>
                )}
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">
              No reviews yet. Be the first to review this recipe!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 
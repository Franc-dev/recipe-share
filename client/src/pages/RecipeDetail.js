import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaClock, FaStar, FaHeart, FaUser, FaEdit, FaTrash, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';

const RecipeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  // Fetch recipe details
  const { data: recipe, isLoading, error } = useQuery(
    ['recipe', id],
    async () => {
      const response = await api.get(`/api/recipes/${id}`);
      return response.data.data;
    }
  );

  // Mutations
  const likeMutation = useMutation(
    () => api.post(`/api/recipes/${id}/like`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Recipe liked!');
      },
      onError: () => toast.error('Failed to like recipe')
    }
  );

  const favoriteMutation = useMutation(
    () => api.post(`/api/recipes/${id}/favorite`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        toast.success('Recipe added to favorites!');
      },
      onError: () => toast.error('Failed to add to favorites')
    }
  );

  const reviewMutation = useMutation(
    () => api.post(`/api/recipes/${id}/reviews`, { rating, comment }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        setRating(0);
        setComment('');
        toast.success('Review added successfully!');
      },
      onError: () => toast.error('Failed to add review')
    }
  );

  const deleteMutation = useMutation(
    () => api.delete(`/api/recipes/${id}`),
    {
      onSuccess: () => {
        toast.success('Recipe deleted successfully!');
        navigate('/my-recipes');
      },
      onError: () => toast.error('Failed to delete recipe')
    }
  );

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12">Error loading recipe</div>;
  if (!recipe) return <div className="text-center py-12">Recipe not found</div>;

  const isAuthor = user && recipe.author._id === user._id;
  const isLiked = recipe.likes && recipe.likes.includes(user?._id);
  const isFavorite = user && user.favoriteRecipes && user.favoriteRecipes.includes(recipe._id);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        {/* Recipe Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="relative h-64 md:h-96">
            {recipe.image ? (
              <img
                src={recipe.image}
                alt={recipe.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100">
                <span className="text-6xl">🍽️</span>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {isAuthenticated && (
                <>
                  <button
                    onClick={() => likeMutation.mutate()}
                    className={`p-2 rounded-full ${
                      isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
                    } hover:bg-red-500 hover:text-white transition-colors`}
                  >
                    <FaHeart />
                  </button>
                  <button
                    onClick={() => favoriteMutation.mutate()}
                    className={`p-2 rounded-full ${
                      isFavorite ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600'
                    } hover:bg-yellow-500 hover:text-white transition-colors`}
                  >
                    ⭐
                  </button>
                </>
              )}
              
              {isAuthor && (
                <>
                  <button
                    onClick={() => navigate(`/edit-recipe/${id}`)}
                    className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">{recipe.title}</h1>
            <p className="text-gray-600 mb-6">{recipe.description}</p>

            {/* Recipe Meta */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <FaClock className="mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-gray-600">Prep Time</p>
                <p className="font-semibold">{formatTime(recipe.prepTime)}</p>
              </div>
              <div className="text-center">
                <FaClock className="mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-gray-600">Cook Time</p>
                <p className="font-semibold">{formatTime(recipe.cookTime)}</p>
              </div>
              <div className="text-center">
                <FaUser className="mx-auto text-orange-500 mb-2" />
                <p className="text-sm text-gray-600">Servings</p>
                <p className="font-semibold">{recipe.servings}</p>
              </div>
              <div className="text-center">
                <FaStar className="mx-auto text-yellow-500 mb-2" />
                <p className="text-sm text-gray-600">Rating</p>
                <p className="font-semibold">{recipe.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white font-bold">
                  {recipe.author.firstName?.charAt(0) || recipe.author.username?.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-semibold">
                  {recipe.author.firstName} {recipe.author.lastName}
                </p>
                <p className="text-sm text-gray-600">@{recipe.author.username}</p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                {recipe.category}
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {recipe.cuisine}
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients and Instructions */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                  <span className="font-medium">{ingredient.amount} {ingredient.unit}</span>
                  <span className="ml-2">{ingredient.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center mr-3 font-bold">
                    {instruction.step}
                  </span>
                  <p className="text-gray-700">{instruction.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>
          
          {/* Add Review Form */}
          {isAuthenticated && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold mb-3">Add Your Review</h3>
              <div className="flex items-center mb-3">
                <span className="mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`text-2xl ${
                      star <= rating ? 'text-yellow-500' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                className="w-full p-2 border border-gray-300 rounded-lg mb-3"
                rows="3"
              />
              <button
                onClick={() => reviewMutation.mutate()}
                disabled={rating === 0}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50"
              >
                Submit Review
              </button>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {recipe.reviews && recipe.reviews.length > 0 ? (
              recipe.reviews.map((review, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {review.user.firstName?.charAt(0) || review.user.username?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">
                        {review.user.firstName} {review.user.lastName}
                      </p>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={`text-sm ${
                              star <= review.rating ? 'text-yellow-500' : 'text-gray-300'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700">{review.comment}</p>}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail; 
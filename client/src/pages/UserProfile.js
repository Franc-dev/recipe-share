import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUser, FaHeart, FaBookmark, FaEye, FaStar, FaClock, FaArrowLeft, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState('recipes');

  // Fetch user profile
  const { data: userProfile, isLoading: profileLoading, error: profileError } = useQuery(
    ['userProfile', username],
    async () => {
      const response = await api.get(`/api/users/profile/${username}`);
      return response.data.data;
    }
  );

  // Fetch user's recipes
  const { data: userRecipes, isLoading: recipesLoading } = useQuery(
    ['userRecipes', username],
    async () => {
      const response = await api.get(`/api/users/${username}/recipes`);
      return response.data.data;
    },
    { enabled: !!username }
  );

  // Fetch user's favorites
  const { data: userFavorites, isLoading: favoritesLoading } = useQuery(
    ['userFavorites', username],
    async () => {
      const response = await api.get(`/api/users/${username}/favorites`);
      return response.data.data;
    },
    { enabled: !!username }
  );

  // Follow/Unfollow mutation
  const followMutation = useMutation(
    async (userId) => {
      const response = await api.post(`/api/users/${userId}/follow`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userProfile', username]);
        toast.success('User followed successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to follow user');
      }
    }
  );

  const unfollowMutation = useMutation(
    async (userId) => {
      const response = await api.delete(`/api/users/${userId}/follow`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['userProfile', username]);
        toast.success('User unfollowed successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to unfollow user');
      }
    }
  );

  const handleFollow = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to follow users');
      return;
    }
    
    if (userProfile.isFollowing) {
      unfollowMutation.mutate(userProfile._id);
    } else {
      followMutation.mutate(userProfile._id);
    }
  };

  const isOwnProfile = currentUser && userProfile && currentUser._id === userProfile._id;

  if (profileLoading) return <LoadingSpinner />;
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">👤</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you're looking for doesn't exist or their profile is private.</p>
          <Link
            to="/"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (!userProfile) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/"
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            Back to Home
          </Link>
        </div>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
                {userProfile.avatar ? (
                  <img
                    src={userProfile.avatar}
                    alt={`${userProfile.firstName} ${userProfile.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaUser className="text-4xl text-orange-500" />
                  </div>
                )}
              </div>
              
              {/* Follow Button */}
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollow}
                  disabled={followMutation.isLoading || unfollowMutation.isLoading}
                  className={`absolute -bottom-2 -right-2 p-3 rounded-full text-white transition-colors ${
                    userProfile.isFollowing 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                >
                  {userProfile.isFollowing ? <FaUserCheck /> : <FaUserPlus />}
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                {userProfile.firstName} {userProfile.lastName}
              </h1>
              <p className="text-xl text-gray-600 mb-4">@{userProfile.username}</p>
              
              {userProfile.bio && (
                <p className="text-gray-700 mb-6 max-w-2xl">
                  {userProfile.bio}
                </p>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">
                    {userRecipes?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">
                    {userFavorites?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Favorites</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">
                    {userProfile.followers?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-500">
                    {userProfile.following?.length || 0}
                  </div>
                  <div className="text-sm text-gray-600">Following</div>
                </div>
              </div>

              {/* Member Since */}
              <div className="text-sm text-gray-500">
                Member since {new Date(userProfile.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('recipes')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recipes'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBookmark className="inline mr-2" />
                Recipes ({userRecipes?.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'favorites'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaHeart className="inline mr-2" />
                Favorites ({userFavorites?.length || 0})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'recipes' ? (
              <div>
                {recipesLoading ? (
                  <LoadingSpinner />
                ) : userRecipes?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userRecipes.map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🍽️</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No recipes yet</h3>
                    <p className="text-gray-600">
                      {isOwnProfile 
                        ? "You haven't created any recipes yet. Start sharing your culinary creations!"
                        : `${userProfile.firstName} hasn't shared any recipes yet.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/create-recipe"
                        className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Create Your First Recipe
                      </Link>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {favoritesLoading ? (
                  <LoadingSpinner />
                ) : userFavorites?.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userFavorites.map((recipe) => (
                      <RecipeCard key={recipe._id} recipe={recipe} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">💔</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No favorites yet</h3>
                    <p className="text-gray-600">
                      {isOwnProfile 
                        ? "You haven't favorited any recipes yet. Start exploring and saving your favorites!"
                        : `${userProfile.firstName} hasn't favorited any recipes yet.`
                      }
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/"
                        className="inline-block mt-4 bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
                      >
                        Explore Recipes
                      </Link>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Recent Activity</h2>
          
          {recipesLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4">
              {userRecipes?.slice(0, 5).map((recipe) => (
                <div key={recipe._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <FaBookmark className="text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <Link 
                      to={`/recipe/${recipe._id}`}
                      className="font-medium text-gray-800 hover:text-orange-600 transition-colors"
                    >
                      {recipe.title}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Created {new Date(recipe.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <FaEye className="mr-1" />
                      {recipe.views || 0}
                    </span>
                    <span className="flex items-center">
                      <FaHeart className="mr-1" />
                      {recipe.likes?.length || 0}
                    </span>
                    <span className="flex items-center">
                      <FaStar className="mr-1" />
                      {recipe.averageRating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              ))}
              
              {userRecipes?.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  No recent activity to show.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
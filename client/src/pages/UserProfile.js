import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi, useMutation } from '../hooks/useApi';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import RecipeCard from '../components/RecipeCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaUser, FaHeart, FaBookmark, FaEye, FaStar, FaClock, FaArrowLeft, FaUserPlus, FaUserCheck } from 'react-icons/fa';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState('recipes');
  const [followLoading, setFollowLoading] = useState(false);

  // Fetch user profile
  const { data: userProfile, loading: profileLoading, error: profileError } = useApi(
    `/api/users/profile/${username}`,
    { enabled: !!username }
  );

  // Fetch user's recipes
  const { data: userRecipes, loading: recipesLoading } = useApi(
    `/api/users/${username}/recipes`,
    { enabled: !!username }
  );

  // Fetch user's favorites
  const { data: userFavorites, loading: favoritesLoading } = useApi(
    `/api/users/${username}/favorites`,
    { enabled: !!username }
  );

  const handleFollow = async () => {
    try {
      setFollowLoading(true);
      await api.post(`/api/users/${username}/follow`);
      toast.success('Successfully followed user!');
      // Refresh user profile data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to follow user');
    } finally {
      setFollowLoading(false);
    }
  };

  // Get user initial for avatar
  const getUserInitial = (user) => {
    if (user.firstName && user.lastName) {
      return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase();
    }
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (profileLoading) {
    return <LoadingSpinner />;
  }

  if (profileError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <h2 className="text-2xl font-bold mb-4">Error Loading Profile</h2>
          <p>{profileError.message}</p>
        </div>
      </div>
    );
  }

  if (!userProfile?.data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User Not Found</h2>
          <p className="text-gray-600">The user you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const user = userProfile.data;
  const isOwnProfile = currentUser && currentUser.username === username;
  const isFollowing = currentUser && user.followers?.includes(currentUser._id);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft className="mr-2" />
        Back to Home
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-orange-100 to-red-100">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">
                    {getUserInitial(user)}
                  </span>
                </div>
              )}
            </div>
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                <FaUserCheck className="text-sm" />
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-gray-600 mb-2">@{user.username}</p>
                {user.bio && (
                  <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
                )}
                
                {/* Stats */}
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                  <div className="flex items-center">
                    <FaBookmark className="mr-1" />
                    <span>{userRecipes?.data?.length || 0} Recipes</span>
                  </div>
                  <div className="flex items-center">
                    <FaHeart className="mr-1" />
                    <span>{userFavorites?.data?.length || 0} Favorites</span>
                  </div>
                  <div className="flex items-center">
                    <FaEye className="mr-1" />
                    <span>{user.followers?.length || 0} Followers</span>
                  </div>
                  <div className="flex items-center">
                    <FaUser className="mr-1" />
                    <span>{user.following?.length || 0} Following</span>
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`px-6 py-2 rounded-md font-medium transition-colors ${
                    isFollowing
                      ? 'bg-gray-500 text-white hover:bg-gray-600'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {followLoading ? (
                    'Loading...'
                  ) : isFollowing ? (
                    <>
                      <FaUserCheck className="inline mr-2" />
                      Following
                    </>
                  ) : (
                    <>
                      <FaUserPlus className="inline mr-2" />
                      Follow
                    </>
                  )}
                </button>
              )}
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
              Recipes ({userRecipes?.data?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('favorites')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'favorites'
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Favorites ({userFavorites?.data?.length || 0})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'recipes' ? (
            <div>
              {recipesLoading ? (
                <LoadingSpinner />
              ) : userRecipes?.data && userRecipes.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userRecipes.data.map(recipe => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    <FaBookmark />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No recipes yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "You haven't created any recipes yet."
                      : `${user.firstName} hasn't created any recipes yet.`
                    }
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div>
              {favoritesLoading ? (
                <LoadingSpinner />
              ) : userFavorites?.data && userFavorites.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userFavorites.data.map(recipe => (
                    <RecipeCard key={recipe._id} recipe={recipe} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">
                    <FaHeart />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">
                    No favorites yet
                  </h3>
                  <p className="text-gray-500">
                    {isOwnProfile 
                      ? "You haven't favorited any recipes yet."
                      : `${user.firstName} hasn't favorited any recipes yet.`
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 
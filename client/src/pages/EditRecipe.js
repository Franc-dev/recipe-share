import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { FaPlus, FaTrash, FaUpload, FaSave, FaArrowLeft } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const EditRecipe = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: 'Medium',
    cuisine: '',
    category: 'Dinner',
    image: '',
    ingredients: [{ name: '', amount: '', unit: '' }],
    instructions: [{ step: 1, description: '' }],
    isPublic: true
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch recipe data
  const { data: recipe, isLoading, error } = useQuery(
    ['recipe', id],
    async () => {
      const response = await api.get(`/api/recipes/${id}`);
      return response.data.data;
    },
    {
      onSuccess: (data) => {
        // Populate form with existing data
        setFormData({
          title: data.title || '',
          description: data.description || '',
          prepTime: data.prepTime?.toString() || '',
          cookTime: data.cookTime?.toString() || '',
          servings: data.servings?.toString() || '',
          difficulty: data.difficulty || 'Medium',
          cuisine: data.cuisine || '',
          category: data.category || 'Dinner',
          image: data.image || '',
          ingredients: data.ingredients?.length > 0 ? data.ingredients : [{ name: '', amount: '', unit: '' }],
          instructions: data.instructions?.length > 0 ? data.instructions : [{ step: 1, description: '' }],
          isPublic: data.isPublic !== undefined ? data.isPublic : true
        });
        setImagePreview(data.image || '');
      }
    }
  );

  // Check if user is the author
  useEffect(() => {
    if (recipe && user && recipe.author._id !== user._id) {
      toast.error('You can only edit your own recipes');
      navigate('/my-recipes');
    }
  }, [recipe, user, navigate]);

  const updateRecipeMutation = useMutation(
    async (recipeData) => {
      const formDataToSend = new FormData();
      
      // Add image if selected
      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }
      
      // Add recipe data
      formDataToSend.append('data', JSON.stringify(recipeData));
      
      const response = await api.put(`/api/recipes/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['recipe', id]);
        queryClient.invalidateQueries(['myRecipes']);
        toast.success('Recipe updated successfully!');
        navigate(`/recipe/${id}`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update recipe');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const updateIngredient = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ingredient, i) => 
        i === index ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, { 
        step: prev.instructions.length + 1, 
        description: '' 
      }]
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions
        .filter((_, i) => i !== index)
        .map((instruction, i) => ({ ...instruction, step: i + 1 }))
    }));
  };

  const updateInstruction = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? { ...instruction, description: value } : instruction
      )
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      toast.error('Recipe title is required');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Recipe description is required');
      return false;
    }
    if (!formData.prepTime || !formData.cookTime || !formData.servings) {
      toast.error('Please fill in all time and serving information');
      return false;
    }
    if (formData.ingredients.some(ing => !ing.name.trim() || !ing.amount.trim())) {
      toast.error('Please fill in all ingredient information');
      return false;
    }
    if (formData.instructions.some(inst => !inst.description.trim())) {
      toast.error('Please fill in all instruction steps');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      const recipeData = {
        ...formData,
        prepTime: parseInt(formData.prepTime),
        cookTime: parseInt(formData.cookTime),
        servings: parseInt(formData.servings)
      };

      updateRecipeMutation.mutate(recipeData);
    } catch (error) {
      toast.error('Failed to update recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 
    'Beverage', 'Appetizer', 'Soup', 'Salad', 'Bread'
  ];

  const difficulties = ['Easy', 'Medium', 'Hard'];
  const cuisines = [
    'Italian', 'Mexican', 'Chinese', 'Japanese', 'Thai', 'Indian', 
    'French', 'American', 'Mediterranean', 'Greek', 'Spanish', 'Korean'
  ];

  const units = [
    'cup', 'tbsp', 'tsp', 'oz', 'lb', 'g', 'kg', 'ml', 'l', 'piece', 
    'slice', 'clove', 'bunch', 'can', 'package', 'whole'
  ];

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-12">Error loading recipe</div>;
  if (!recipe) return <div className="text-center py-12">Recipe not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Edit Recipe</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recipe Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter recipe title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cuisine
                </label>
                <select
                  name="cuisine"
                  value={formData.cuisine}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Select cuisine</option>
                  {cuisines.map(cuisine => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  {difficulties.map(difficulty => (
                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Describe your recipe..."
                required
              />
            </div>
          </div>

          {/* Time and Servings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Time & Servings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prep Time (minutes) *
                </label>
                <input
                  type="number"
                  name="prepTime"
                  value={formData.prepTime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cook Time (minutes) *
                </label>
                <input
                  type="number"
                  name="cookTime"
                  value={formData.cookTime}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Servings *
                </label>
                <input
                  type="number"
                  name="servings"
                  value={formData.servings}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Image Upload */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Recipe Image</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload New Image
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors">
                    <FaUpload className="inline mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  {imageFile && (
                    <span className="text-sm text-gray-600">
                      {imageFile.name}
                    </span>
                  )}
                </div>
              </div>

              {imagePreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-64 h-48 object-cover rounded-lg border"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Ingredients */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Ingredients *</h2>
              <button
                type="button"
                onClick={addIngredient}
                className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Ingredient
              </button>
            </div>

            <div className="space-y-4">
              {formData.ingredients.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <input
                    type="text"
                    placeholder="Amount"
                    value={ingredient.amount}
                    onChange={(e) => updateIngredient(index, 'amount', e.target.value)}
                    className="w-24 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <select
                    value={ingredient.unit}
                    onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                    className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Ingredient name"
                    value={ingredient.name}
                    onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {formData.ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Instructions *</h2>
              <button
                type="button"
                onClick={addInstruction}
                className="flex items-center bg-green-500 text-white px-3 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Step
              </button>
            </div>

            <div className="space-y-4">
              {formData.instructions.map((instruction, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">
                    {instruction.step}
                  </div>
                  <textarea
                    placeholder="Describe this step..."
                    value={instruction.description}
                    onChange={(e) => updateInstruction(index, e.target.value)}
                    rows="3"
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  {formData.instructions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeInstruction(index)}
                      className="p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Privacy Settings</h2>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="isPublic"
                checked={formData.isPublic}
                onChange={handleInputChange}
                className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Make this recipe public (visible to everyone)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
            >
              <FaSave className="mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Recipe'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRecipe; 
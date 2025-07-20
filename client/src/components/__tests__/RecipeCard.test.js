import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RecipeCard from '../RecipeCard';

// Mock the useAuth hook
jest.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { _id: 'test-user-id' },
    isAuthenticated: true
  })
}));

const mockRecipe = {
  _id: 'recipe-1',
  title: 'Test Recipe',
  description: 'A delicious test recipe',
  cookingTime: 30,
  servings: 4,
  difficulty: 'Easy',
  author: {
    _id: 'author-1',
    username: 'testauthor',
    firstName: 'Test',
    lastName: 'Author'
  },
  createdAt: '2023-01-01T00:00:00.000Z'
};

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('RecipeCard Component', () => {
  it('renders recipe information correctly', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);

    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
    expect(screen.getByText('A delicious test recipe')).toBeInTheDocument();
    expect(screen.getByText('30 min')).toBeInTheDocument();
    expect(screen.getByText('4 servings')).toBeInTheDocument();
    expect(screen.getByText('Easy')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('renders with different difficulty levels', () => {
    const mediumRecipe = { ...mockRecipe, difficulty: 'Medium' };
    const hardRecipe = { ...mockRecipe, difficulty: 'Hard' };

    const { rerender } = renderWithRouter(<RecipeCard recipe={mediumRecipe} />);
    expect(screen.getByText('Medium')).toBeInTheDocument();

    rerender(
      <BrowserRouter>
        <RecipeCard recipe={hardRecipe} />
      </BrowserRouter>
    );
    expect(screen.getByText('Hard')).toBeInTheDocument();
  });

  it('handles missing author information gracefully', () => {
    const recipeWithoutAuthor = {
      ...mockRecipe,
      author: null
    };

    renderWithRouter(<RecipeCard recipe={recipeWithoutAuthor} />);
    expect(screen.getByText('Unknown Author')).toBeInTheDocument();
  });

  it('handles missing cooking time gracefully', () => {
    const recipeWithoutTime = {
      ...mockRecipe,
      cookingTime: null
    };

    renderWithRouter(<RecipeCard recipe={recipeWithoutTime} />);
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });

  it('handles missing servings gracefully', () => {
    const recipeWithoutServings = {
      ...mockRecipe,
      servings: null
    };

    renderWithRouter(<RecipeCard recipe={recipeWithoutServings} />);
    expect(screen.getByText('N/A servings')).toBeInTheDocument();
  });

  it('displays formatted date correctly', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    // Check if the date is displayed (format may vary based on implementation)
    const dateElement = screen.getByText(/Jan 1, 2023/);
    expect(dateElement).toBeInTheDocument();
  });

  it('has clickable elements for navigation', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    // Check if the recipe title is clickable (assuming it's a link)
    const titleElement = screen.getByText('Test Recipe');
    expect(titleElement.closest('a')).toBeInTheDocument();
  });

  it('displays favorite button when user is authenticated', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} onFavorite={jest.fn()} />);
    
    // Look for favorite button
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('handles favorite button click', () => {
    const mockOnFavorite = jest.fn();
    renderWithRouter(<RecipeCard recipe={mockRecipe} onFavorite={mockOnFavorite} />);
    
    const favoriteButton = screen.getByRole('button', { name: /favorite/i });
    fireEvent.click(favoriteButton);
    
    expect(mockOnFavorite).toHaveBeenCalledWith(mockRecipe._id);
  });

  it('does not display favorite button when onFavorite prop is not provided', () => {
    renderWithRouter(<RecipeCard recipe={mockRecipe} />);
    
    // Should not find favorite button
    expect(screen.queryByRole('button', { name: /favorite/i })).not.toBeInTheDocument();
  });
}); 
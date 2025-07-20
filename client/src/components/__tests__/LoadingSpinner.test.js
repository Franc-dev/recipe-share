import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from '../LoadingSpinner';

describe('LoadingSpinner Component', () => {
  test('renders loading spinner', () => {
    render(<LoadingSpinner />);
    
    // Check if loading text is present
    const loadingElement = screen.getByText(/loading/i);
    expect(loadingElement).toBeInTheDocument();
  });

  test('renders with custom message', () => {
    const customMessage = 'Please wait...';
    render(<LoadingSpinner message={customMessage} />);
    
    const loadingElement = screen.getByText(customMessage);
    expect(loadingElement).toBeInTheDocument();
  });

  test('has loading spinner element', () => {
    render(<LoadingSpinner />);
    
    // Check if spinner element exists (assuming it has a specific class or role)
    const spinnerElement = document.querySelector('.spinner') || 
                          document.querySelector('[data-testid="spinner"]') ||
                          document.querySelector('.loading-spinner');
    
    expect(spinnerElement).toBeInTheDocument();
  });
}); 
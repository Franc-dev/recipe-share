import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock the API calls
jest.mock('../../utils/api', () => ({
  login: jest.fn(),
  register: jest.fn(),
  getProfile: jest.fn()
}));

const TestComponent = () => {
  const { user, isAuthenticated, login, logout, register } = useAuth();
  
  return (
    <div>
      <div data-testid="auth-status">
        {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
      </div>
      <div data-testid="user-info">
        {user ? user.username : 'No User'}
      </div>
      <button onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button onClick={() => register('testuser', 'test@example.com', 'password', 'Test', 'User')}>
        Register
      </button>
      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
};

const renderWithAuth = (component) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    jest.clearAllMocks();
  });

  it('provides initial unauthenticated state', () => {
    renderWithAuth(<TestComponent />);
    
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
  });

  it('loads user from localStorage on mount', async () => {
    const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    // Mock successful profile fetch
    const { getProfile } = require('../../utils/api');
    getProfile.mockResolvedValue({ success: true, user: mockUser });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });

  it('handles login successfully', async () => {
    const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    const { login: apiLogin } = require('../../utils/api');
    apiLogin.mockResolvedValue({
      success: true,
      token: mockToken,
      user: mockUser
    });

    renderWithAuth(<TestComponent />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('testuser');
    });

    expect(localStorage.getItem('token')).toBe(mockToken);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
  });

  it('handles login failure', async () => {
    const { login: apiLogin } = require('../../utils/api');
    apiLogin.mockRejectedValue(new Error('Invalid credentials'));

    renderWithAuth(<TestComponent />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });
  });

  it('handles registration successfully', async () => {
    const mockUser = { _id: '1', username: 'newuser', email: 'new@example.com' };
    const mockToken = 'mock-token';
    
    const { register: apiRegister } = require('../../utils/api');
    apiRegister.mockResolvedValue({
      success: true,
      token: mockToken,
      user: mockUser
    });

    renderWithAuth(<TestComponent />);

    const registerButton = screen.getByText('Register');
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('newuser');
    });
  });

  it('handles logout', async () => {
    // Set up authenticated state first
    const mockUser = { _id: '1', username: 'testuser', email: 'test@example.com' };
    const mockToken = 'mock-token';
    
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    const { getProfile } = require('../../utils/api');
    getProfile.mockResolvedValue({ success: true, user: mockUser });

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-info')).toHaveTextContent('No User');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('handles profile fetch failure', async () => {
    const mockToken = 'mock-token';
    localStorage.setItem('token', mockToken);

    const { getProfile } = require('../../utils/api');
    getProfile.mockRejectedValue(new Error('Token expired'));

    renderWithAuth(<TestComponent />);

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');
    });

    // Should clear invalid token
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('provides loading state during authentication', async () => {
    const { login: apiLogin } = require('../../utils/api');
    
    // Create a promise that doesn't resolve immediately
    let resolveLogin;
    const loginPromise = new Promise((resolve) => {
      resolveLogin = resolve;
    });
    apiLogin.mockReturnValue(loginPromise);

    renderWithAuth(<TestComponent />);

    const loginButton = screen.getByText('Login');
    fireEvent.click(loginButton);

    // During the loading state, we should still show not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not Authenticated');

    // Resolve the promise
    resolveLogin({
      success: true,
      token: 'mock-token',
      user: { _id: '1', username: 'testuser' }
    });

    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });
  });
}); 
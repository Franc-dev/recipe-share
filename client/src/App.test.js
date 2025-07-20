import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the AuthContext
jest.mock('./contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn()
  })
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('App Component', () => {
  test('renders without crashing', () => {
    renderWithRouter(<App />);
    // Basic test to ensure the app renders without errors
    expect(document.body).toBeInTheDocument();
  });

  test('renders main application container', () => {
    renderWithRouter(<App />);
    // Check if the main app container exists
    const appElement = document.querySelector('.App') || document.querySelector('#root');
    expect(appElement).toBeInTheDocument();
  });
}); 
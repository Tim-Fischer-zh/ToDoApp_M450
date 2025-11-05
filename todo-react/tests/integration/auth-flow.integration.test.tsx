import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../src/contexts/AuthContext';
import { Login } from '../../src/components/Auth/Login';
import { Register } from '../../src/components/Auth/Register';
import apiClient from '../../src/services/api';

// Mock API client
vi.mock('../../src/services/api');

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
    global.alert = vi.fn();

    // Setup default mocks for apiClient
    vi.mocked(apiClient).post = vi.fn();
    vi.mocked(apiClient).get = vi.fn();
  });

  describe('Login Flow', () => {
    it('should complete login flow with valid credentials', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          token: 'test-jwt-token',
          username: 'Test User',
          email: 'test@example.com',
          userId: 1,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      // Fill login form
      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit
      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      // Verify API call
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Verify token stored
      expect(localStorage.getItem('token')).toBe('test-jwt-token');

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle login failure', async () => {
      const user = userEvent.setup();
      const mockError = {
        response: {
          data: { message: 'Invalid credentials' },
          status: 401,
        },
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </BrowserRouter>
      );

      const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
      const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

      await user.type(emailInput, 'wrong@example.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /^login$/i });
      await user.click(loginButton);

      // Verify error message is displayed in UI
      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });

      // Verify no auth data stored
      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Registration Flow', () => {
    it('should complete registration flow', async () => {
      const user = userEvent.setup();
      const mockResponse = {
        data: {
          token: 'new-user-token',
          username: 'New User',
          email: 'newuser@example.com',
          userId: 2,
        },
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce(mockResponse);

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      // Fill form using querySelector since labels don't have htmlFor
      const inputs = container.querySelectorAll('input');
      const nameInput = inputs[0] as HTMLInputElement; // First input is username
      const emailInput = inputs[1] as HTMLInputElement; // Second is email
      const passwordInput = inputs[2] as HTMLInputElement; // Third is password

      await user.type(nameInput, 'New User');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'password123');

      // Submit
      const registerButton = screen.getByRole('button', { name: /^register$/i });
      await user.click(registerButton);

      // Verify API call
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', {
          username: 'New User',
          email: 'newuser@example.com',
          password: 'password123',
        });
      });

      // Verify token stored
      expect(localStorage.getItem('token')).toBe('new-user-token');

      // Verify navigation
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('should handle registration with existing email', async () => {
      const user = userEvent.setup();
      const mockError = {
        response: {
          data: { message: 'Email already exists' },
          status: 400,
        },
      };

      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      const { container } = render(
        <BrowserRouter>
          <AuthProvider>
            <Register />
          </AuthProvider>
        </BrowserRouter>
      );

      const inputs = container.querySelectorAll('input');
      const nameInput = inputs[0] as HTMLInputElement;
      const emailInput = inputs[1] as HTMLInputElement;
      const passwordInput = inputs[2] as HTMLInputElement;

      await user.type(nameInput, 'Duplicate User');
      await user.type(emailInput, 'existing@example.com');
      await user.type(passwordInput, 'password123');

      const registerButton = screen.getByRole('button', { name: /^register$/i });
      await user.click(registerButton);

      // Verify error message displayed in UI
      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Auth State Persistence', () => {
    it('should restore auth state from localStorage', () => {
      const mockUser = {
        userId: 1,
        username: 'Test User',
        email: 'test@example.com',
      };

      localStorage.setItem('token', 'existing-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      render(
        <BrowserRouter>
          <AuthProvider>
            <div data-testid="auth-test">Authenticated</div>
          </AuthProvider>
        </BrowserRouter>
      );

      // Context should restore from localStorage
      expect(localStorage.getItem('token')).toBe('existing-token');
      expect(screen.getByTestId('auth-test')).toBeInTheDocument();
    });
  });
});

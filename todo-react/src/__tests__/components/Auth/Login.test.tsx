import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../../components/Auth/Login';
import { AuthProvider } from '../../../contexts/AuthContext';
import { authService } from '../../../services/authService';

vi.mock('../../../services/authService');

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUser).mockReturnValue(null);
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Login />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render login form', () => {
    const { container } = renderLogin();

    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^login$/i })).toBeInTheDocument();
  });

  it('should show link to register page', () => {
    renderLogin();

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should update email and password fields on user input', async () => {
    const user = userEvent.setup();
    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should successfully login with valid credentials', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock-jwt-token',
      username: 'testuser',
      email: 'test@example.com',
      userId: 1,
    };

    vi.mocked(authService.login).mockResolvedValueOnce(mockAuthResponse);

    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should show loading state during login', async () => {
    const user = userEvent.setup();

    vi.mocked(authService.login).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    expect(loginButton).toBeDisabled();
  });

  it('should show error message on login failure', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          message: 'Invalid credentials',
        },
      },
    };

    vi.mocked(authService.login).mockRejectedValueOnce(mockError);

    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show generic error message when response has no message', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Network error');

    vi.mocked(authService.login).mockRejectedValueOnce(mockError);

    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const loginButton = screen.getByRole('button', { name: /^login$/i });

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should require email and password fields', () => {
    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should validate email format', () => {
    const { container } = renderLogin();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;

    expect(emailInput.type).toBe('email');
  });

  it('should hide password input', () => {
    const { container } = renderLogin();

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');
  });
});

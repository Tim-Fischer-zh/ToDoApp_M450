import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { Register } from '../../../components/Auth/Register';
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    vi.mocked(authService.getToken).mockReturnValue(null);
    vi.mocked(authService.getUser).mockReturnValue(null);
  });

  const renderRegister = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Register />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render register form', () => {
    const { container } = renderRegister();

    expect(screen.getByText('Todo App')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();

    const usernameInput = container.querySelector('input[type="text"]');
    const emailInput = container.querySelector('input[type="email"]');
    const passwordInput = container.querySelector('input[type="password"]');

    expect(usernameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^register$/i })).toBeInTheDocument();
  });

  it('should show link to login page', () => {
    renderRegister();

    const loginLink = screen.getByRole('link', { name: /login/i });
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should update form fields on user input', async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');

    expect(usernameInput.value).toBe('newuser');
    expect(emailInput.value).toBe('new@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  it('should successfully register with valid data', async () => {
    const user = userEvent.setup();
    const mockAuthResponse = {
      token: 'mock-jwt-token',
      username: 'newuser',
      email: 'new@example.com',
      userId: 2,
    };

    vi.mocked(authService.register).mockResolvedValueOnce(mockAuthResponse);

    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /^register$/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(registerButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  it('should show loading state during registration', async () => {
    const user = userEvent.setup();

    vi.mocked(authService.register).mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /^register$/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(registerButton);

    expect(screen.getByText('Registering...')).toBeInTheDocument();
    expect(registerButton).toBeDisabled();
  });

  it('should validate password length (client-side)', async () => {
    const user = userEvent.setup();
    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /^register$/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'pass'); // Less than 6 characters
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    expect(authService.register).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show error message on registration failure', async () => {
    const user = userEvent.setup();
    const mockError = {
      response: {
        data: {
          message: 'User already exists',
        },
      },
    };

    vi.mocked(authService.register).mockRejectedValueOnce(mockError);

    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /^register$/i });

    await user.type(usernameInput, 'existinguser');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('User already exists')).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should show generic error message when response has no message', async () => {
    const user = userEvent.setup();
    const mockError = new Error('Network error');

    vi.mocked(authService.register).mockRejectedValueOnce(mockError);

    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    const registerButton = screen.getByRole('button', { name: /^register$/i });

    await user.type(usernameInput, 'newuser');
    await user.type(emailInput, 'new@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(registerButton);

    await waitFor(() => {
      expect(screen.getByText('Registration failed')).toBeInTheDocument();
    });
  });

  it('should require all form fields', () => {
    const { container } = renderRegister();

    const usernameInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;
    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    expect(usernameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  it('should validate email format', () => {
    const { container } = renderRegister();

    const emailInput = container.querySelector('input[type="email"]') as HTMLInputElement;

    expect(emailInput.type).toBe('email');
  });

  it('should have minimum password length attribute', () => {
    const { container } = renderRegister();

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;

    expect(passwordInput.type).toBe('password');
    expect(passwordInput.minLength).toBe(6);
  });

  it('should show password requirement hint', () => {
    renderRegister();

    expect(screen.getByText(/min 6 characters/i)).toBeInTheDocument();
  });
});

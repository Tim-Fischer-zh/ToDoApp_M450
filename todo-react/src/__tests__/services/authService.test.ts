import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authService } from '../../services/authService';
import apiClient from '../../services/api';
import { AuthResponse, LoginRequest, RegisterRequest } from '../../types';

vi.mock('../../services/api');

describe('authService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login and return auth response', async () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse: AuthResponse = {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com',
        userId: 1,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockAuthResponse,
      } as any);

      const result = await authService.login(mockLoginRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/login', mockLoginRequest);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when login fails', async () => {
      const mockLoginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(authService.login(mockLoginRequest)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register and return auth response', async () => {
      const mockRegisterRequest: RegisterRequest = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockAuthResponse: AuthResponse = {
        token: 'mock-jwt-token',
        username: 'newuser',
        email: 'new@example.com',
        userId: 2,
      };

      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockAuthResponse,
      } as any);

      const result = await authService.register(mockRegisterRequest);

      expect(apiClient.post).toHaveBeenCalledWith('/api/auth/register', mockRegisterRequest);
      expect(result).toEqual(mockAuthResponse);
    });

    it('should throw error when registration fails', async () => {
      const mockRegisterRequest: RegisterRequest = {
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'password123',
      };

      const mockError = new Error('User already exists');
      vi.mocked(apiClient.post).mockRejectedValueOnce(mockError);

      await expect(authService.register(mockRegisterRequest)).rejects.toThrow('User already exists');
    });
  });

  describe('token management', () => {
    it('should store and retrieve token from localStorage', () => {
      const mockToken = 'mock-jwt-token';

      authService.setToken(mockToken);
      const retrievedToken = authService.getToken();

      expect(retrievedToken).toBe(mockToken);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should return null when no token exists', () => {
      const token = authService.getToken();
      expect(token).toBeNull();
    });

    it('should remove token on logout', () => {
      authService.setToken('mock-token');
      authService.logout();

      expect(authService.getToken()).toBeNull();
    });
  });

  describe('user management', () => {
    it('should store and retrieve user from localStorage', () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      authService.setUser(mockUser);
      const retrievedUser = authService.getUser();

      expect(retrievedUser).toEqual(mockUser);
    });

    it('should return null when no user exists', () => {
      const user = authService.getUser();
      expect(user).toBeNull();
    });

    it('should remove user on logout', () => {
      const mockUser = { userId: 1, username: 'test', email: 'test@example.com' };
      authService.setUser(mockUser);
      authService.logout();

      expect(authService.getUser()).toBeNull();
    });
  });

  describe('logout', () => {
    it('should clear both token and user from localStorage', () => {
      authService.setToken('mock-token');
      authService.setUser({ userId: 1, username: 'test', email: 'test@example.com' });

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});

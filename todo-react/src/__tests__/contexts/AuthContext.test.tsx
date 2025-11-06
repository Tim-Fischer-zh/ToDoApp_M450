import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { ReactNode } from 'react';

vi.mock('../../services/authService');

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
  );

  describe('useAuth hook', () => {
    it('should throw error when used outside AuthProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = originalError;
    });

    it('should provide auth context when used within AuthProvider', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('isAuthenticated');
    });
  });

  describe('initial state', () => {
    it('should start with no user and loading true', () => {
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getUser).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should restore user from localStorage on mount', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(authService.getUser).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should successfully login user', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockAuthResponse = {
        token: 'mock-jwt-token',
        username: 'testuser',
        email: 'test@example.com',
        userId: 1,
      };

      vi.mocked(authService.login).mockResolvedValueOnce(mockAuthResponse);
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getUser).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login(mockCredentials);
      });

      expect(authService.login).toHaveBeenCalledWith(mockCredentials);
      expect(authService.setToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(authService.setUser).toHaveBeenCalledWith({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(result.current.user).toEqual({
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should handle login error', async () => {
      const mockCredentials = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockError = new Error('Invalid credentials');
      vi.mocked(authService.login).mockRejectedValueOnce(mockError);
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getUser).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login(mockCredentials);
        })
      ).rejects.toThrow('Invalid credentials');

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('register', () => {
    it('should successfully register user', async () => {
      const mockRegisterData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      };

      const mockAuthResponse = {
        token: 'mock-jwt-token',
        username: 'newuser',
        email: 'new@example.com',
        userId: 2,
      };

      vi.mocked(authService.register).mockResolvedValueOnce(mockAuthResponse);
      vi.mocked(authService.getToken).mockReturnValue(null);
      vi.mocked(authService.getUser).mockReturnValue(null);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.register(mockRegisterData);
      });

      expect(authService.register).toHaveBeenCalledWith(mockRegisterData);
      expect(authService.setToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(authService.setUser).toHaveBeenCalledWith({
        userId: 2,
        username: 'newuser',
        email: 'new@example.com',
      });
      expect(result.current.user).toEqual({
        userId: 2,
        username: 'newuser',
        email: 'new@example.com',
      });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('logout', () => {
    it('should successfully logout user', async () => {
      const mockUser = {
        userId: 1,
        username: 'testuser',
        email: 'test@example.com',
      };

      vi.mocked(authService.getToken).mockReturnValue('mock-token');
      vi.mocked(authService.getUser).mockReturnValue(mockUser);

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
      });

      act(() => {
        result.current.logout();
      });

      expect(authService.logout).toHaveBeenCalled();
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});

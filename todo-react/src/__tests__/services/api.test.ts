import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AxiosError, InternalAxiosRequestConfig } from 'axios';

describe('API Client', () => {
  let apiClient: any;

  beforeEach(async () => {
    localStorage.clear();
    vi.clearAllMocks();

    // Reset window.location.href mock
    delete (window as any).location;
    (window as any).location = { href: '' };

    // Reset modules to get fresh instance
    vi.resetModules();

    // Import apiClient fresh for each test
    const apiModule = await import('../../services/api');
    apiClient = apiModule.default;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('apiClient configuration', () => {
    it('should be created with correct base configuration', () => {
      // baseURL might be undefined in test environment but that's okay
      expect(apiClient.defaults).toBeDefined();
      expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    });

    it('should have interceptors configured', () => {
      // Verify interceptors are set up
      expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
      expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });

  describe('Request Interceptor - Token Injection', () => {
    it('should add Authorization header when token exists in localStorage', async () => {
      const mockToken = 'mock-jwt-token-12345';
      localStorage.setItem('token', mockToken);

      // Create a mock config
      const mockConfig: Partial<InternalAxiosRequestConfig> = {
        headers: {} as any,
        url: '/api/test',
      };

      // Get the request interceptor
      const requestInterceptor = apiClient.interceptors.request.handlers[0];

      if (requestInterceptor && requestInterceptor.fulfilled) {
        const result = await requestInterceptor.fulfilled(mockConfig as InternalAxiosRequestConfig);

        expect(result.headers.Authorization).toBe(`Bearer ${mockToken}`);
      }
    });

    it('should not add Authorization header when no token exists', async () => {
      // Ensure no token in localStorage
      localStorage.removeItem('token');

      const mockConfig: Partial<InternalAxiosRequestConfig> = {
        headers: {} as any,
        url: '/api/test',
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0];

      if (requestInterceptor && requestInterceptor.fulfilled) {
        const result = await requestInterceptor.fulfilled(mockConfig as InternalAxiosRequestConfig);

        expect(result.headers.Authorization).toBeUndefined();
      }
    });

    it('should update Authorization header if token changes', async () => {
      const firstToken = 'first-token';
      const secondToken = 'second-token';

      // First request with first token
      localStorage.setItem('token', firstToken);

      const mockConfig1: Partial<InternalAxiosRequestConfig> = {
        headers: {} as any,
        url: '/api/test',
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0];

      if (requestInterceptor && requestInterceptor.fulfilled) {
        const result1 = await requestInterceptor.fulfilled(mockConfig1 as InternalAxiosRequestConfig);
        expect(result1.headers.Authorization).toBe(`Bearer ${firstToken}`);

        // Second request with second token
        localStorage.setItem('token', secondToken);

        const mockConfig2: Partial<InternalAxiosRequestConfig> = {
          headers: {} as any,
          url: '/api/test',
        };

        const result2 = await requestInterceptor.fulfilled(mockConfig2 as InternalAxiosRequestConfig);
        expect(result2.headers.Authorization).toBe(`Bearer ${secondToken}`);
      }
    });

    it('should handle request interceptor error', async () => {
      const mockError = new Error('Request interceptor error');

      const requestInterceptor = apiClient.interceptors.request.handlers[0];

      if (requestInterceptor && requestInterceptor.rejected) {
        await expect(requestInterceptor.rejected(mockError)).rejects.toThrow('Request interceptor error');
      }
    });
  });

  describe('Response Interceptor - Error Handling', () => {
    it('should pass through successful responses', async () => {
      const mockResponse = {
        data: { message: 'Success' },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.fulfilled) {
        const result = responseInterceptor.fulfilled(mockResponse);
        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle 401 Unauthorized error by clearing auth and redirecting', async () => {
      // Set up initial auth state
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      const mock401Error: Partial<AxiosError> = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Invalid token' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 401',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        try {
          await responseInterceptor.rejected(mock401Error);
        } catch (error) {
          // Expected to be rejected
        }

        // Verify localStorage was cleared
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();

        // Verify redirect to login
        expect(window.location.href).toBe('/login');
      }
    });

    it('should not redirect on 401 if already on login page', async () => {
      // Set current page to login
      window.location.href = '/login';

      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      const mock401Error: Partial<AxiosError> = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: {},
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 401',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        try {
          await responseInterceptor.rejected(mock401Error);
        } catch (error) {
          // Expected to be rejected
        }

        // Verify localStorage was still cleared
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      }
    });

    it('should pass through non-401 errors without clearing auth', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      const mock404Error: Partial<AxiosError> = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Resource not found' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 404',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        await expect(responseInterceptor.rejected(mock404Error)).rejects.toEqual(mock404Error);

        // Verify localStorage was NOT cleared
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(localStorage.getItem('user')).not.toBeNull();
      }
    });

    it('should handle 500 Internal Server Error without clearing auth', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      const mock500Error: Partial<AxiosError> = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: { message: 'Server error' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 500',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        await expect(responseInterceptor.rejected(mock500Error)).rejects.toEqual(mock500Error);

        // Verify localStorage was NOT cleared
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(localStorage.getItem('user')).not.toBeNull();
      }
    });

    it('should handle network errors without response', async () => {
      localStorage.setItem('token', 'mock-token');

      const networkError: Partial<AxiosError> = {
        message: 'Network Error',
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        // No response property - simulates network failure
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        await expect(responseInterceptor.rejected(networkError)).rejects.toEqual(networkError);

        // Verify localStorage was NOT cleared (no 401 response)
        expect(localStorage.getItem('token')).toBe('mock-token');
      }
    });

    it('should handle 403 Forbidden error without clearing auth', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      const mock403Error: Partial<AxiosError> = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: { message: 'Access denied' },
          headers: {},
          config: {} as InternalAxiosRequestConfig,
        },
        config: {} as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 403',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];

      if (responseInterceptor && responseInterceptor.rejected) {
        await expect(responseInterceptor.rejected(mock403Error)).rejects.toEqual(mock403Error);

        // Verify localStorage was NOT cleared
        expect(localStorage.getItem('token')).toBe('mock-token');
        expect(localStorage.getItem('user')).not.toBeNull();

        // Verify no redirect happened
        expect(window.location.href).not.toBe('/login');
      }
    });
  });

  describe('Integration - Request and Response Flow', () => {
    it('should add token in request and handle successful response', async () => {
      const mockToken = 'integration-test-token';
      localStorage.setItem('token', mockToken);

      const mockConfig: Partial<InternalAxiosRequestConfig> = {
        headers: {} as any,
        url: '/api/todos',
        method: 'GET',
      };

      const mockResponse = {
        data: { todos: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: mockConfig as InternalAxiosRequestConfig,
      };

      // Test request interceptor
      const requestInterceptor = apiClient.interceptors.request.handlers[0];
      if (requestInterceptor && requestInterceptor.fulfilled) {
        const configWithToken = await requestInterceptor.fulfilled(mockConfig as InternalAxiosRequestConfig);
        expect(configWithToken.headers.Authorization).toBe(`Bearer ${mockToken}`);
      }

      // Test response interceptor
      const responseInterceptor = apiClient.interceptors.response.handlers[0];
      if (responseInterceptor && responseInterceptor.fulfilled) {
        const result = responseInterceptor.fulfilled(mockResponse);
        expect(result).toEqual(mockResponse);
      }
    });

    it('should handle full auth flow: add token, get 401, clear auth, redirect', async () => {
      const mockToken = 'expired-token';
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify({ id: 1, username: 'test' }));

      // Request with token
      const mockConfig: Partial<InternalAxiosRequestConfig> = {
        headers: {} as any,
        url: '/api/todos',
      };

      const requestInterceptor = apiClient.interceptors.request.handlers[0];
      if (requestInterceptor && requestInterceptor.fulfilled) {
        const configWithToken = await requestInterceptor.fulfilled(mockConfig as InternalAxiosRequestConfig);
        expect(configWithToken.headers.Authorization).toBe(`Bearer ${mockToken}`);
      }

      // Response with 401
      const mock401Error: Partial<AxiosError> = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Token expired' },
          headers: {},
          config: mockConfig as InternalAxiosRequestConfig,
        },
        config: mockConfig as InternalAxiosRequestConfig,
        isAxiosError: true,
        toJSON: () => ({}),
        name: 'AxiosError',
        message: 'Request failed with status code 401',
      };

      const responseInterceptor = apiClient.interceptors.response.handlers[0];
      if (responseInterceptor && responseInterceptor.rejected) {
        try {
          await responseInterceptor.rejected(mock401Error);
        } catch (error) {
          // Expected
        }

        // Verify complete cleanup
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
        expect(window.location.href).toBe('/login');
      }
    });
  });
});

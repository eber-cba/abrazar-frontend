import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, getRefreshToken, saveToken, clearAuthData } from '../utils/storage';
import { handleError } from '../utils/error-handler';
import { sessionLogger } from '../utils/session-logger';

// ============================================
// API Configuration
// ============================================

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Refresh Token Logic
// ============================================

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

/**
 * Add request to queue while refreshing token
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all queued requests with new token
 */
const onTokenRefreshed = (newToken: string) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

/**
 * Reject all queued requests on refresh failure
 */
const onRefreshFailed = () => {
  refreshSubscribers = [];
};

/**
 * Attempt to refresh the access token
 */
const refreshAccessToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      sessionLogger.logRefreshFailed('No refresh token available');
      return null;
    }

    sessionLogger.logTokenExpired();

    // Use a separate axios instance to avoid interceptor recursion
    const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });

    const newToken = response.data?.data?.token || response.data?.token;
    
    if (newToken) {
      await saveToken(newToken);
      sessionLogger.logRefreshSuccess();
      return newToken;
    }

    sessionLogger.logRefreshFailed('No token in response');
    return null;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    sessionLogger.logRefreshFailed(message);
    return null;
  }
};

/**
 * Handle forced logout when refresh fails
 */
const handleForcedLogout = async (reason: string) => {
  sessionLogger.logForcedLogout(reason);
  await clearAuthData();
  
  // Note: Navigation should be handled by the app's auth state listener
  // This function only clears the data
};

// ============================================
// Request Interceptor
// ============================================

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    
    if (__DEV__) {
      console.log('🔐 API Request:', {
        url: config.url,
        method: config.method?.toUpperCase(),
        hasToken: !!token,
      });
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// ============================================
// Response Interceptor with Refresh Token
// ============================================

api.interceptors.response.use(
  (response) => {
    if (__DEV__) {
      console.log('✅ API Response:', {
        url: response.config.url,
        status: response.status,
      });
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (__DEV__) {
      console.error('❌ API Error:', {
        url: originalRequest?.url,
        status,
        message: error.message,
      });
    }

    // Handle 401 Unauthorized - Token expired
    if (status === 401 && originalRequest && !originalRequest._retry) {
      // Check if it's a login request (don't refresh for login errors)
      if (originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();

        if (newToken) {
          // Notify queued requests
          onTokenRefreshed(newToken);
          isRefreshing = false;

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } else {
          // Refresh failed - force logout
          onRefreshFailed();
          isRefreshing = false;
          await handleForcedLogout('Token refresh failed');
          return Promise.reject(error);
        }
      } catch (refreshError) {
        onRefreshFailed();
        isRefreshing = false;
        await handleForcedLogout('Token refresh error');
        return Promise.reject(error);
      }
    }

    // Handle 403 Forbidden - No permission
    if (status === 403) {
      sessionLogger.logAuthError('Access forbidden - insufficient permissions');
    }

    // Handle 5xx Server Errors
    if (status && status >= 500) {
      if (__DEV__) {
        console.error('💥 Server Error:', error.response?.data);
      }
    }

    // Use centralized error handler for user-friendly messages
    const userMessage = handleError(error);
    
    // Attach user-friendly message to error for UI consumption
    (error as any).userMessage = userMessage;

    return Promise.reject(error);
  }
);

// ============================================
// API Services
// ============================================

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  me: () =>
    api.get('/auth/me'),
};

export const homelessService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/homeless', { params }),
  
  getById: (id: string) =>
    api.get(`/homeless/${id}`),
  
  create: (data: any) =>
    api.post('/homeless', data),
  
  update: (id: string, data: any) =>
    api.patch(`/homeless/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/homeless/${id}`),
};

export const servicePointsService = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get('/service-points', { params }),
  
  getPublic: () =>
    api.get('/service-points/public'),
  
  getById: (id: string) =>
    api.get(`/service-points/${id}`),
  
  create: (data: any) =>
    api.post('/service-points', data),
  
  update: (id: string, data: any) =>
    api.patch(`/service-points/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/service-points/${id}`),
};

export const casesService = {
  getAll: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/cases', { params }),
  
  getById: (id: string) =>
    api.get(`/cases/${id}`),
  
  create: (data: any) =>
    api.post('/cases', data),
  
  update: (id: string, data: any) =>
    api.patch(`/cases/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/cases/${id}`),
  
  assign: (id: string, userId: string) =>
    api.post(`/cases/${id}/assign`, { userId }),
  
  getHistory: (id: string) =>
    api.get(`/cases/${id}/history`),
};

export const statisticsService = {
  getOverview: () =>
    api.get('/statistics/overview'),
  
  getCasesByStatus: () =>
    api.get('/statistics/cases-by-status'),
  
  getByZone: () =>
    api.get('/statistics/zones'),
};

export const teamsService = {
  getAll: () =>
    api.get('/teams'),
  
  getById: (id: string) =>
    api.get(`/teams/${id}`),
  
  create: (data: any) =>
    api.post('/teams', data),
  
  update: (id: string, data: any) =>
    api.patch(`/teams/${id}`, data),
};

export const zonesService = {
  getAll: () =>
    api.get('/zones'),
  
  getById: (id: string) =>
    api.get(`/zones/${id}`),
  
  create: (data: any) =>
    api.post('/zones', data),
};

export const sessionsService = {
  getMy: () =>
    api.get('/sessions/my'),
  
  revoke: (id: string) =>
    api.delete(`/sessions/${id}`),
  
  revokeAll: () =>
    api.delete('/sessions/all'),
};

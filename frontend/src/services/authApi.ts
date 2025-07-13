import axios from 'axios';
import { LoginRequest, AuthResponse, User, AuthStatusResponse } from '../types/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const authApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Include cookies for session management
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authService = {
  // Login with OpenStack credentials
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await authApi.post<AuthResponse>('/auth/login', credentials);
    return response.data;
  },

  // Logout current session
  async logout(): Promise<void> {
    await authApi.post('/auth/logout');
  },

  // Get current user info
  async getCurrentUser(): Promise<User> {
    const response = await authApi.get<User>('/auth/me');
    return response.data;
  },

  // Check authentication status
  async getAuthStatus(): Promise<AuthStatusResponse> {
    const response = await authApi.get<AuthStatusResponse>('/auth/status');
    return response.data;
  },
};

// Response interceptor for error handling
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Auth API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    // 임시로 리다이렉트 비활성화 - 디버깅 목적
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   console.log('Redirecting to login due to 401');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);
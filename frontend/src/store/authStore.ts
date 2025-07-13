import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types/auth';
import { authService } from '../services/authApi';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, project?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string, project?: string) => {
        set({ isLoading: true });
        try {
          console.log('AuthStore: Logging in with:', { username, project });
          const response = await authService.login({
            username,
            password,
            project,
            domain: 'default',
          });
          console.log('AuthStore: Login response:', response);

          if (response.success && response.user) {
            console.log('AuthStore: Login successful, setting auth state');
            set({
              user: response.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          console.log('AuthStore: Login error:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.warn('Logout API call failed:', error);
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      checkAuthStatus: async () => {
        try {
          console.log('AuthStore: Checking auth status...');
          const status = await authService.getAuthStatus();
          console.log('AuthStore: Auth status response:', status);
          if (status.authenticated) {
            console.log('AuthStore: Getting current user...');
            const user = await authService.getCurrentUser();
            console.log('AuthStore: Current user response:', user);
            set({
              user,
              isAuthenticated: true,
            });
          } else {
            console.log('AuthStore: Not authenticated, clearing auth');
            // 임시로 비활성화 - 디버깅 목적
            // get().clearAuth();
          }
        } catch (error) {
          console.log('AuthStore: Error in checkAuthStatus:', error);
          // 임시로 비활성화 - 디버깅 목적
          // get().clearAuth();
        }
      },

      clearAuth: () => {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
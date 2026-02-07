import apiClient from './client';
import type { LoginCredentials, RegisterData, User, AuthTokens } from '../types';

export const authAPI = {
  login: async (credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/login', credentials);
    return data;
  },

  register: async (userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/register', userData);
    return data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const { data } = await apiClient.get('/auth/profile');
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  refreshToken: async (refreshToken: string): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post('/auth/refresh-token', { refreshToken });
    return data;
  },
};

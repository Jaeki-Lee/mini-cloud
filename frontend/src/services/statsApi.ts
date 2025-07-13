import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const statsApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export interface DashboardStats {
  totalInstances: number;
  runningInstances: number;
  totalImages: number;
  activeImages: number;
  publicImages: number;
}

export const statsService = {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await statsApi.get<DashboardStats>('/stats');
    return response.data;
  }
};
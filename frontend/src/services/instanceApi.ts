import axios from 'axios';
import {
  Instance,
  InstanceListResponse,
  CreateInstanceRequest,
  InstanceActionRequest,
  InstanceActionResponse,
  Flavor
} from '../types/instance';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Create axios instance with default config
const instanceApi = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Include cookies for session management
  headers: {
    'Content-Type': 'application/json',
  },
});

export const instanceService = {
  // Get all instances
  async getInstances(): Promise<InstanceListResponse> {
    const response = await instanceApi.get<InstanceListResponse>('/instances');
    return response.data;
  },

  // Get instance by ID
  async getInstance(instanceId: string): Promise<Instance> {
    const response = await instanceApi.get<Instance>(`/instances/${instanceId}`);
    return response.data;
  },

  // Create new instance
  async createInstance(request: CreateInstanceRequest): Promise<Instance> {
    const response = await instanceApi.post<Instance>('/instances', request);
    return response.data;
  },

  // Perform instance action (start, stop, restart, etc.)
  async performInstanceAction(
    instanceId: string, 
    actionRequest: InstanceActionRequest
  ): Promise<InstanceActionResponse> {
    const response = await instanceApi.post<InstanceActionResponse>(
      `/instances/${instanceId}/action`, 
      actionRequest
    );
    return response.data;
  },

  // Delete instance
  async deleteInstance(instanceId: string): Promise<InstanceActionResponse> {
    const response = await instanceApi.delete<InstanceActionResponse>(
      `/instances/${instanceId}`
    );
    return response.data;
  },

  // Get available flavors
  async getFlavors(): Promise<Flavor[]> {
    const response = await instanceApi.get<Flavor[]>('/flavors');
    return response.data;
  }
};

// Response interceptor for error handling
instanceApi.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('Instance API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    // 임시로 리다이렉트 비활성화 - 디버깅 목적
    // if (error.response?.status === 401) {
    //   // Handle unauthorized access
    //   console.log('Redirecting to login due to 401 from instance API');
    //   window.location.href = '/login';
    // }
    return Promise.reject(error);
  }
);
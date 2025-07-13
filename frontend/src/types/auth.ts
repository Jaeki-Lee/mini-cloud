export interface LoginRequest {
  username: string;
  password: string;
  project?: string;
  domain?: string;
}

export interface User {
  id: string;
  name: string;
  domain: string;
  project: {
    id: string;
    name: string;
    domain: string;
  };
  roles: string[];
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
}

export interface AuthStatusResponse {
  authenticated: boolean;
  sessionId?: string;
}

export interface ApiError {
  message: string;
  success?: boolean;
}
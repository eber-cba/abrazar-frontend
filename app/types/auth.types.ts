/**
 * Authentication TypeScript Types
 * Defines all types related to user authentication and authorization
 */

/**
 * User roles in the system
 */
export type UserRole = 'ADMIN' | 'MUNICIPALITY' | 'NGO';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Authentication tokens
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Response from login endpoint
 */
export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

/**
 * Auth context state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

/**
 * Auth context actions
 */
export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

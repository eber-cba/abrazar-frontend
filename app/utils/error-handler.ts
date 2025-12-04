/**
 * Global Error Handler
 * Transforms backend errors into user-friendly Spanish messages
 */

import { AxiosError } from 'axios';
import { ApiError } from '../types';

/**
 * Error message mappings - add more as needed
 */
const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'Invalid credentials': 'Email o contraseña incorrectos',
  'Invalid token': 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  'Token expired': 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  'Unauthorized': 'No tienes permisos para realizar esta acción',
  'User already exists': 'Ya estás registrado. Intenta iniciar sesión',
  'Email already in use': 'Este email ya está registrado',
  
  // Validation errors
  'Validation failed': 'Por favor verifica los datos ingresados',
  'Invalid email': 'El email ingresado no es válido',
  'Invalid password': 'La contraseña debe tener al menos 6 caracteres',
  'Missing required fields': 'Datos incompletos. Por favor completa todos los campos',
  'Invalid input': 'Los datos ingresados no son válidos',
  
  // Server errors
  'Internal server error': 'Error del servidor. Por favor intenta nuevamente',
  'Service unavailable': 'Servidor no disponible. Intenta más tarde',
  'Bad gateway': 'Servidor no disponible. Intenta más tarde',
  'Gateway timeout': 'El servidor tardó demasiado en responder',
  
  // Network errors
  'Network Error': 'Sin conexión a Internet. Verifica tu conexión',
  'ECONNREFUSED': 'No se pudo conectar al servidor',
  'timeout': 'La solicitud tardó demasiado. Intenta nuevamente',
  
  // Resource errors
  'Not found': 'No se encontró el recurso solicitado',
  'Resource not found': 'No se encontró el recurso solicitado',
  'Already exists': 'Este elemento ya existe',
  
  // Permission errors
  'Forbidden': 'No tienes permisos para acceder a este recurso',
  'Access denied': 'Acceso denegado',
};

/**
 * Status code to message mapping
 */
const STATUS_MESSAGES: Record<number, string> = {
  400: 'Solicitud inválida. Verifica los datos ingresados',
  401: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
  403: 'No tienes permisos para realizar esta acción',
  404: 'No se encontró el recurso solicitado',
  409: 'Ya existe un elemento con estos datos',
  422: 'Los datos ingresados no son válidos',
  429: 'Demasiadas solicitudes. Por favor espera un momento',
  500: 'Error del servidor. Por favor intenta nuevamente',
  502: 'Servidor no disponible. Intenta más tarde',
  503: 'Servidor no disponible. Intenta más tarde',
  504: 'El servidor tardó demasiado en responder',
};

/**
 * Default error message
 */
const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error inesperado. Por favor intenta nuevamente';

/**
 * Extract error message from various error formats
 */
function extractErrorMessage(error: any): string {
  // Check if it's an axios error with response data
  if (error.response?.data) {
    const data = error.response.data;
    
    // Try to get message from common backend response formats
    if (typeof data.message === 'string') return data.message;
    if (typeof data.error === 'string') return data.error;
    if (typeof data.detail === 'string') return data.detail;
    if (typeof data.details === 'string') return data.details;
    
    // Handle validation errors array
    if (Array.isArray(data.errors)) {
      return data.errors.map((e: any) => e.message || e).join(', ');
    }
  }
  
  // Check error message property
  if (typeof error.message === 'string') return error.message;
  
  // Check error code
  if (error.code) return error.code;
  
  return '';
}

/**
 * Find matching friendly message
 */
function findFriendlyMessage(errorMessage: string): string | null {
  // Exact match
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }
  
  // Partial match (case insensitive)
  const lowerMessage = errorMessage.toLowerCase();
  for (const [key, value] of Object.entries(ERROR_MESSAGES)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return null;
}

/**
 * Main error handler function
 * Transforms any error into a user-friendly Spanish message
 */
export function handleError(error: unknown): string {
  // Handle axios errors
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError<ApiError>;
    
    // Network error (no response from server)
    if (!axiosError.response) {
      if (axiosError.message === 'Network Error') {
        return ERROR_MESSAGES['Network Error'];
      }
      if (axiosError.code === 'ECONNREFUSED') {
        return ERROR_MESSAGES['ECONNREFUSED'];
      }
      if (axiosError.code === 'ECONNABORTED' || axiosError.message.includes('timeout')) {
        return ERROR_MESSAGES['timeout'];
      }
      return 'No se pudo conectar al servidor';
    }
    
    // Try status code mapping first
    const statusCode = axiosError.response.status;
    if (STATUS_MESSAGES[statusCode]) {
      // Extract actual error message for better context
      const actualMessage = extractErrorMessage(axiosError);
      const friendlyMessage = findFriendlyMessage(actualMessage);
      
      // Return specific message if found, otherwise status message
      return friendlyMessage || STATUS_MESSAGES[statusCode];
    }
    
    // Try to extract and map error message
    const errorMessage = extractErrorMessage(axiosError);
    if (errorMessage) {
      const friendlyMessage = findFriendlyMessage(errorMessage);
      if (friendlyMessage) return friendlyMessage;
    }
  }
  
  // Handle standard Error objects
  if (error instanceof Error) {
    const friendlyMessage = findFriendlyMessage(error.message);
    if (friendlyMessage) return friendlyMessage;
    
    // Return original message if it's user-friendly (no stack trace, etc.)
    if (error.message && error.message.length < 100 && !error.message.includes('\n')) {
      return error.message;
    }
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    const friendlyMessage = findFriendlyMessage(error);
    return friendlyMessage || error;
  }
  
  // Default fallback
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Log error to console in development
 */
export function logError(error: unknown, context?: string): void {
  if (__DEV__) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
}

/**
 * Combined handler: log and return friendly message
 */
export function handleAndLogError(error: unknown, context?: string): string {
  logError(error, context);
  return handleError(error);
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return !axiosError.response || axiosError.message === 'Network Error';
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Check if error is a validation error
 */
export function isValidationError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 400 || axiosError.response?.status === 422;
  }
  return false;
}

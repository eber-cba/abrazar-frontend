import axios from 'axios';
import { getToken } from '../utils/storage';

// 🔧 Configuración del cliente API
// Conexión al backend de Abrazar (Node.js + Express + Prisma)

// Base URL del backend desde variables de entorno
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Crear instancia de Axios
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Set baseURL directly on instance (recommended approach)
api.defaults.baseURL = `${API_BASE_URL}/api`;

// Interceptor para agregar token de autenticación automáticamente
api.interceptors.request.use(
  async (config) => {
    // Obtener token del storage
    const token = await getToken();
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;

    // Manejar token expirado (401)
    if (status === 401) {
      // TODO: Implementar refresh token o cerrar sesión
      console.log('Token expirado, redirigir a login');
      // Podrías emitir un evento o llamar a logout aquí
    }

    // Manejar error de servidor (5xx)
    if (status && status >= 500) {
      console.error('Error del servidor:', error.response?.data);
    }

    return Promise.reject(error);
  }
);

// ============================================
// Servicios de API (ejemplos)
// ============================================

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (data: any) =>
    api.post('/auth/register', data),
  
  logout: () =>
    api.post('/auth/logout'),
  
  me: () =>
    api.get('/auth/me'),
};

export const homelessService = {
  getAll: () =>
    api.get('/homeless'),
  
  getById: (id: string) =>
    api.get(`/homeless/${id}`),
  
  create: (data: any) =>
    api.post('/homeless', data),
  
  update: (id: string, data: any) =>
    api.patch(`/homeless/${id}`, data),
};

export const servicePointsService = {
  getAll: () =>
    api.get('/service-points'),
  
  getNearby: (lat: number, lng: number, radius: number = 5 ) =>
    api.get('/service-points/nearby', { params: { lat, lng, radius } }),
};

// Exportar servicios individuales si es necesario
export default api;

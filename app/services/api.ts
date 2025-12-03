import axios from 'axios';

// 🔧 Configuración del cliente API
// Conexión al backend de Abrazar (Node.js + Express + Prisma)

// Base URL del backend
// En desarrollo: http://localhost:3000
// En producción: tu dominio de Railway/Vercel
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Crear instancia de Axios
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use(
  async (config) => {
    // Aquí obtendrías el token del storage (AsyncStorage o SecureStore)
    // const token = await AsyncStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
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

    // Manejar token expirado
    if (status === 401) {
      // Lógica para refrescar token o cerrar sesión
      console.log('Token expirado, redirigir a login');
    }

    // Manejar error de servidor
    if (status >= 500) {
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

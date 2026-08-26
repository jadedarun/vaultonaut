import axios from 'axios';
import { tokenStorage } from '../services/tokenStorage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000,
});

// Request Interceptor: Attach JWT token automatically
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const devToken = sessionStorage.getItem('vaultonaut_dev_token');
    if (devToken) {
      config.headers['X-Developer-Token'] = devToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized globally
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || '';
      if (
        !url.includes('/developer/authorize') && 
        !url.includes('/health/detailed') && 
        !url.includes('/settings') && 
        !url.includes('/search/similarity')
      ) {
        console.warn('Unauthorized request or expired JWT. Clearing session...');
        tokenStorage.clearSession();
      } else {
        console.warn('Developer mode check or diagnostics failed. Retaining active session.');
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

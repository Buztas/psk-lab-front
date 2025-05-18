import { authService } from './authService';

const API_URL = 'http://localhost:8080';

export const apiService = {
  fetch: async (endpoint, options = {}) => {
    const token = authService.getToken();
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (response.status === 401) {
      authService.logout();
      window.location.href = '/';
      throw new Error('Session expired. Please log in again.');
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  },
  
  getUserProfile: async () => {
    return await apiService.fetch('/api/user/profile');
  },
  
};

export default apiService;
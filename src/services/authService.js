import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://localhost:8080';

export const authService = {
  login: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An unknown error occurred'
        }));
        
        const error = new Error(errorData.message || 'Login failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      const data = await response.json();
      const decodedData = jwtDecode(data.token);

      localStorage.setItem('token', data.token);
      
      const user = {
        id: decodedData?.id,
        email: email,
        role: data.userResponse?.roleType || 'CUSTOMER'
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          password,
          roleType: 'CUSTOMER'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'An unknown error occurred'
        }));
        
        const error = new Error(errorData.message || 'Registration failed');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return localStorage.getItem('token') !== null;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

export default authService;
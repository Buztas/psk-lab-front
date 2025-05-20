const API_URL = 'http://localhost:8080';

export const menuService = {
  getAllMenuItems: async (page = 0, size = 20, sort = "name,asc") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = `${API_URL}/api/menu/items?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to fetch menu items'
        }));
        
        const error = new Error(errorData.message || 'Failed to fetch menu items');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching menu items:', error);
      throw error;
    }
  },

  getAllVariations: async (page = 0, size = 30, sort = "name,asc") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const url = `${API_URL}/api/menu/variations?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to fetch variations'
        }));
        
        const error = new Error(errorData.message || 'Failed to fetch variations');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching variations:', error);
      throw error;
    }
  },
  
  getMenuItemById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(`${API_URL}/api/menu/items/${id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to fetch menu item'
        }));
        
        const error = new Error(errorData.message || 'Failed to fetch menu item');
        error.status = response.status;
        error.data = errorData;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching menu item:', error);
      throw error;
    }
  }
};

export default menuService;
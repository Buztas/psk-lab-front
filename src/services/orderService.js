const API_URL = 'http://localhost:8080';

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to create order'
        }));
        throw new Error(errorData.message || `Error creating order: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  getOrderById: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to get order'
        }));
        throw new Error(errorData.message || `Error getting order: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting order:', error);
      throw error;
    }
  },
  

  getAllOrders: async (page = 0, size = 20, sort = "orderDate,desc") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const url = `${API_URL}/api/orders?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to get orders'
        }));
        throw new Error(errorData.message || `Error getting orders: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting orders:', error);
      throw error;
    }
  },
  
  getMyOrders: async (page = 0, size = 10, sort = "orderDate,desc") => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const url = `${API_URL}/api/orders/my-orders?page=${page}&size=${size}&sort=${encodeURIComponent(sort)}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to get my orders'
        }));
        throw new Error(errorData.message || `Error getting my orders: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting my orders:', error);
      throw error;
    }
  },
  
  updateOrderStatus: async (orderId, newStatus, version) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newStatus: newStatus,
          version: version
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to update order status'
        }));
        throw new Error(errorData.message || `Error updating order status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  deleteOrder: async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${API_URL}/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          message: 'Failed to delete order'
        }));
        throw new Error(errorData.message || `Error deleting order: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
};

export default orderService;
const API_URL = 'http://localhost:8080';

export const adminMenuService = {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createVariation,
  updateVariation,
  deleteVariation,
};

async function createMenuItem(data) {
  return handleRequest(`${API_URL}/api/menu/items`, 'POST', data, 'Failed to create menu item');
}

async function updateMenuItem(id, data) {
  return handleRequest(`${API_URL}/api/menu/items/${id}`, 'PUT', data, 'Failed to update menu item');
}

async function deleteMenuItem(id) {
  return handleRequest(`${API_URL}/api/menu/items/${id}`, 'DELETE', null, 'Failed to delete menu item');
}

async function createVariation(data) {
  return handleRequest(`${API_URL}/api/menu/variations`, 'POST', data, 'Failed to create variation');
}

async function updateVariation(id, data) {
  return handleRequest(`${API_URL}/api/menu/variations/${id}`, 'PUT', data, 'Failed to update variation');
}

async function deleteVariation(id) {
  return handleRequest(`${API_URL}/api/menu/variations/${id}`, 'DELETE', null, 'Failed to delete variation');
}

async function handleRequest(url, method, body = null, defaultErrorMsg) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: defaultErrorMsg }));
      const error = new Error(errorData.message || defaultErrorMsg);
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204) return null;
    return await response.json();
  } catch (error) {
    console.error(`${method} ${url} failed:`, error);
    throw error;
  }
}

export default adminMenuService;

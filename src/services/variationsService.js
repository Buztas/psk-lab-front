const API_URL = 'http://localhost:8080';

export const variationsService = {
  async getItemVariations(page = 0, size = 20, sort = "name,asc") {
    return request(`${API_URL}/api/menu/variations?page=${page}&size=${size}&sort=${sort}`);
  },

  async getItemVariationById(id) {
    return request(`${API_URL}/api/menu/variations/${id}`);
  },

  async createItemVariation(data) {
    return request(`${API_URL}/api/menu/variations`, 'POST', data);
  },

  async updateItemVariation(id, data) {
    return request(`${API_URL}/api/menu/variations/${id}`, 'PUT', data);
  },

  async deleteItemVariation(id) {
    return request(`${API_URL}/api/menu/variations/${id}`, 'DELETE');
  }
};

async function request(url, method = 'GET', body = null) {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');

    const res = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.message || `Request failed with status ${res.status}`);
    }

    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    console.error(`[${method}] ${url} failed:`, err);
    throw err;
  }
}

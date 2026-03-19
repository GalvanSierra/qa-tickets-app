const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  };

  const response = await fetch(`${API_BASE_URL}${path}`, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'Ocurrio un error al comunicarse con el servidor.');
    error.details = data.details || [];
    throw error;
  }

  return data;
}

export const api = {
  login(credentials) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },
  getTickets(filters = {}) {
    const params = new URLSearchParams();

    if (filters.estado) {
      params.set('estado', filters.estado);
    }

    if (filters.prioridad) {
      params.set('prioridad', filters.prioridad);
    }

    const query = params.toString();
    const path = query ? `/tickets?${query}` : '/tickets';

    return request(path);
  },
  getTicket(id) {
    return request(`/tickets/${id}`);
  },
  createTicket(payload) {
    return request('/tickets', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  updateTicket(id, payload) {
    return request(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },
  updateTicketStatus(id, estado) {
    return request(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ estado })
    });
  },
  deleteTicket(id) {
    return request(`/tickets/${id}`, {
      method: 'DELETE'
    });
  }
};
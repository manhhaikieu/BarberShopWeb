const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('barber_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Lỗi không xác định');
  }
  return data;
};

// ── Auth ──────────────────────────────────────────────
export const authAPI = {
  login: (email, password) =>
    fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  register: (data) =>
    fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${BASE_URL}/auth/profile`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getStaffUsers: () =>
    fetch(`${BASE_URL}/auth/staff-users`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Services ──────────────────────────────────────────
export const serviceAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/services`, { headers: getHeaders() }).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/services/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/services`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/services/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Bookings ──────────────────────────────────────────
export const bookingAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/bookings?${query}`, { headers: getHeaders() }).then(handleResponse);
  },

  getBusySlots: (date) =>
    fetch(`${BASE_URL}/bookings/busy?date=${date}`, { headers: getHeaders() }).then(handleResponse),

  getMy: () =>
    fetch(`${BASE_URL}/bookings/my`, { headers: getHeaders() }).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/bookings/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateStatus: (id, status) =>
    fetch(`${BASE_URL}/bookings/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    }).then(handleResponse),

  cancel: (id) =>
    fetch(`${BASE_URL}/bookings/${id}/cancel`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Products ──────────────────────────────────────────
export const productAPI = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${BASE_URL}/products?${query}`, { headers: getHeaders() }).then(handleResponse);
  },

  getById: (id) =>
    fetch(`${BASE_URL}/products/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  sell: (id, quantity) =>
    fetch(`${BASE_URL}/products/${id}/sell`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ quantity }),
    }).then(handleResponse),
};

// ── Upload ────────────────────────────────────────────
export const uploadAPI = {
  uploadProductImage: (file) => {
    const token = localStorage.getItem('barber_token');
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${BASE_URL}/upload/product-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(handleResponse);
  },
};

// ── Barbers ───────────────────────────────────────────
export const barberAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/barbers`, { headers: getHeaders() }).then(handleResponse),

  getById: (id) =>
    fetch(`${BASE_URL}/barbers/${id}`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/barbers`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/barbers/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/barbers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  getSchedule: (id, date) =>
    fetch(`${BASE_URL}/barbers/${id}/schedule?date=${date}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  getMySchedule: (date) =>
    fetch(`${BASE_URL}/barbers/my-schedule?date=${date || ''}`, {
      headers: getHeaders(),
    }).then(handleResponse),
};

// ── Chairs ────────────────────────────────────────────
export const chairAPI = {
  getAll: () =>
    fetch(`${BASE_URL}/chairs`, { headers: getHeaders() }).then(handleResponse),

  create: (data) =>
    fetch(`${BASE_URL}/chairs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  update: (id, data) =>
    fetch(`${BASE_URL}/chairs/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  delete: (id) =>
    fetch(`${BASE_URL}/chairs/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

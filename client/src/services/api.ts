import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  updateProfile: (data: any) => api.patch('/auth/profile', data)
};


// Bands API
export const bandsAPI = {
  list: () => api.get('/bands'),
    create: (data: any) => api.post('/bands', data),
  join: (inviteCode: any, instrument: any) => api.post('/bands/join', { inviteCode, instrument }),
  get: (id: any) => api.get(`/bands/${id}`),
  update: (id: any, data: any) => api.patch(`/bands/${id}`, data),
  leave: (id: any) => api.post(`/bands/${id}/leave`),
  regenerateCode: (id: any) => api.post(`/bands/${id}/regenerate-code`)
};

// Songs API
export const songsAPI = {
  list: (bandId: any) => api.get(`/songs?bandId=${bandId}`),
  create: (data: any) => api.post('/songs', data),
  get: (id: any) => api.get(`/songs/${id}`),
  update: (id: any, data: any) => api.patch(`/songs/${id}`, data),
  delete: (id: any) => api.delete(`/songs/${id}`)
};

export default api;
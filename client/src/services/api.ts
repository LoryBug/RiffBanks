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

// Assets API
export const assetsAPI = {
  list: (songId: any) => api.get(`/assets?songId=${songId}`),
  upload: (formData: any) => api.post('/assets', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  createText: (data: any) => api.post('/assets/text', data),
  vote: (id: any) => api.post(`/assets/${id}/vote`),
  delete: (id: any) => api.delete(`/assets/${id}`)
};

// Messages API
export const messagesAPI = {
  list: (songId: any, before = null, limit = 50) => {
    let url = `/messages?songId=${songId}&limit=${limit}`;
    if (before) url += `&before=${before}`;
    return api.get(url);
  },
  getUnreadCounts: () => api.get('/messages/unread-counts'),
  markAsRead: (songId: any) => api.post('/messages/mark-read', { songId })
};

// Gigs API 
export const gigsAPI = {
  list: (params: any = {}) => {
    const query = new URLSearchParams();
    if (params.type) query.append('type', params.type);
    if (params.role) query.append('role', params.role);
    if (params.genre) query.append('genre', params.genre);
    if (params.search) query.append('search', params.search);
    const queryStr = query.toString();
    return api.get(`/gigs${queryStr ? `?${queryStr}` : ''}`);
  },
  myGigs: () => api.get('/gigs/my-gigs'),
  get: (id: any) => api.get(`/gigs/${id}`),
  create: (data: any) => api.post('/gigs', data),
  update: (id: any, data: any) => api.patch(`/gigs/${id}`, data),
  delete: (id: any) => api.delete(`/gigs/${id}`),
  apply: (id: any, message: any) => api.post(`/gigs/${id}/apply`, { message }),
  withdraw: (id: any) => api.post(`/gigs/${id}/withdraw`),
  respond: (id: any, applicantId: any, action: any) => api.post(`/gigs/${id}/respond`, { applicantId, action }),
  getNewGigsCount: () => api.get('/gigs/notifications/new-count'),
  markGigBoardVisited: () => api.post('/gigs/notifications/mark-visited')
};


export default api;
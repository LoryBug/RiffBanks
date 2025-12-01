import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Bands API
export const bandsAPI = {
  list: () => api.get('/bands')
};

export default api;
import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Bands API (Phase 2)
export const bandsAPI = {
  list: () => api.get('/bands')
};
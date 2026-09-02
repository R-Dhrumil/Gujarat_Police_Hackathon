import api from './api';

export const authApi = {
  login: (username, password) => api.post('/auth/login-json', { username, password }),
  getCurrentUser: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  registerUser: (data) => api.post('/auth/register', data)
};

import api from './api';

export const anprApi = {
  getResults: (params = {}) => api.get('/anpr/results', { params }),
  trackVehicle: (plateNumber) => api.get(`/anpr/track/${plateNumber}`),
  simulateDetection: (data) => api.post('/anpr/simulate-detection', data)
};

import api from './api';

export const vmsApi = {
  getVMSSystems: (params = {}) => api.get('/vms', { params }),
  getVMS: (id) => api.get(`/vms/${id}`),
  createVMS: (data) => api.post('/vms', data),
  updateVMS: (id, data) => api.put(`/vms/${id}`, data),
  deleteVMS: (id) => api.delete(`/vms/${id}`),
  testConnection: (id) => api.post(`/vms/${id}/test-connection`)
};

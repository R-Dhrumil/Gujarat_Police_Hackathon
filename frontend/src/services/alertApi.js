import api from './api';

export const alertApi = {
  getAlerts: (params = {}) => api.get('/alerts', { params }),
  getAlert: (id) => api.get(`/alerts/${id}`),
  acknowledgeAlert: (id, resolutionNotes = 'Acknowledged by operator') => 
    api.post(`/alerts/${id}/acknowledge`, { resolution_notes: resolutionNotes }),
  triggerTestAlert: (params = {}) => api.post('/alerts/trigger-test', null, { params })
};

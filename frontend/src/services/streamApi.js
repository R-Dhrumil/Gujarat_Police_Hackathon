import api from './api';

export const streamApi = {
  getStreamUrls: (cameraId) => api.get(`/streams/${cameraId}`),
  startAnalytics: (cameraId) => api.post(`/streams/${cameraId}/start-analytics`),
  stopAnalytics: (cameraId) => api.post(`/streams/${cameraId}/stop-analytics`)
};

import api from './api';

export const reportsApi = {
  getGapAnalysisReport: () => api.get('/reports/gap-analysis'),
  getDashboardStats: () => api.get('/reports/dashboard-stats')
};

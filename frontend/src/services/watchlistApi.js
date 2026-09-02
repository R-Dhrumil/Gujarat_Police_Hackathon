import api from './api';

export const watchlistApi = {
  getWatchlist: (params = {}) => api.get('/watchlist', { params }),
  addToWatchlist: (data) => api.post('/watchlist', data),
  updateWatchlist: (id, data) => api.put(`/watchlist/${id}`, data),
  deleteWatchlist: (id) => api.delete(`/watchlist/${id}`)
};

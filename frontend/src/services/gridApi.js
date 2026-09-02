import api from './api';

export const gridApi = {
  getCatalogue: (gridHost = null) => api.get('/grid/catalogue', { params: { grid_host: gridHost } }),
  syncCameras: (gridHost = null) => api.post('/grid/sync', null, { params: { grid_host: gridHost } })
};

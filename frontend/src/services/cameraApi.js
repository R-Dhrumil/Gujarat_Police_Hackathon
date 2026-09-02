import api from './api';

export const cameraApi = {
  getCameras: (params = {}) => api.get('/cameras', { params }),
  getGeoJSON: (params = {}) => api.get('/cameras/geojson', { params }),
  getNearbyCameras: (lat, lng, radiusKm = 5) => 
    api.get('/cameras/nearby', { params: { lat, lng, radius_km: radiusKm } }),
  getCamera: (id) => api.get(`/cameras/${id}`),
  createCamera: (data) => api.post('/cameras', data),
  updateCamera: (id, data) => api.put(`/cameras/${id}`, data),
  deleteCamera: (id) => api.delete(`/cameras/${id}`),
  
  // Bulk Import
  bulkImportPreview: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/cameras/bulk-import/preview', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  bulkImportConfirm: (rows, autoCreateDepartments = true, defaultDeptId = null) => {
    return api.post('/cameras/bulk-import/confirm', {
      rows,
      auto_create_departments: autoCreateDepartments,
      default_department_id: defaultDeptId
    });
  },

  // Export CSV
  exportCSVUrl: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return `http://localhost:8000/api/v1/cameras/export?${queryString}`;
  }
};

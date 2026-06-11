import api from './index';

/**
 * Divisions API endpoints
 */
export const divisionsApi = {
  getAll: () => api.get('/divisions'),
  getOne: (id) => api.get(`/divisions/${id}`),
  create: (data) => api.post('/divisions', data),
  update: (id, data) => api.put(`/divisions/${id}`, data),
  delete: (id) => api.delete(`/divisions/${id}`),
};

// For backward compatibility
export const fetchDivisions = () => divisionsApi.getAll();
export const createDivision = data => divisionsApi.create(data);
export const updateDivision = (id, data) => divisionsApi.update(id, data);
export const deleteDivision = id => divisionsApi.delete(id);

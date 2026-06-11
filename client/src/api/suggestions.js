import api from './index';

export const suggestionsApi = {
  // Employee
  getAll: (params) => api.get('/suggestions', { params }),
  create: (data) => api.post('/suggestions', data),
  vote: (id) => api.patch(`/suggestions/${id}/vote`),
  
  // Admin
  getStats: () => api.get('/suggestions/stats'),
  updateStatus: (id, data) => api.patch(`/suggestions/${id}/status`, data),
  delete: (id) => api.delete(`/suggestions/${id}`),
};
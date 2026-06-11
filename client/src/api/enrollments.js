import api from './index';

/**
 * Enrollments API endpoints
 */
export const enrollmentsApi = {
  getAll: (params) => api.get('/enrollments', { params }),
  getByFormation: (formationId, params) => api.get(`/enrollments/formation/${formationId}`, { params }),
  getByUser: (userId, params) => api.get(`/enrollments/user/${userId}`, { params }),
  
  create: (data) => api.post('/enrollments', data),
  
  // ✅ AJOUTÉ : Mettre à jour une inscription (statut, résultat, notes)
  update: (id, data) => api.patch(`/enrollments/${id}`, data),
  
  // Status updates
  updateStatus: (id, status) => api.patch(`/enrollments/${id}/status`, { status }),
  
  delete: (id) => api.delete(`/enrollments/${id}`),
  
  // Export
  exportCSV: (formationId) => api.get(`/enrollments/export/formation/${formationId}`, { responseType: 'blob' }),
};

// For backward compatibility
export const fetchEnrollments = () => enrollmentsApi.getAll();
export const createEnrollment = data => enrollmentsApi.create(data);
export const updateEnrollment = (id, data) => enrollmentsApi.update(id, data);
export const deleteEnrollment = id => enrollmentsApi.delete(id);
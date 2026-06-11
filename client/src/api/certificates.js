import api from './index';

/**
 * Certificates API endpoints
 */
export const certificatesApi = {
  getAll: (params) => api.get('/certificates', { params }),
  getByUser: (userId) => api.get(`/certificates/user/${userId}`),
  
  // Certificate generation
  generate: (enrollmentId) => api.post(`/certificates/generate/${enrollmentId}`),
  generatePersonal: (personalTrainingId) => api.post(`/certificates/personal/${personalTrainingId}`),
  
  // Email management
  sendEmail: (id) => api.post(`/certificates/${id}/send`),
  
  // File operations
  download: (id) => api.get(`/certificates/${id}/download`, { responseType: 'blob' }),
  
  // CRUD operations
  update: (id, data) => api.put(`/certificates/${id}`, data),
  delete: (id) => api.delete(`/certificates/${id}`),
};
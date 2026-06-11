import api from './index';

/**
 * Personal Trainings API endpoints
 * For trainings done at personal expense
 */
export const personalTrainingsApi = {
  // Get personal trainings
  getAll: (params) => api.get('/personal-trainings', { params }),
  getByUser: (userId, params) => api.get(`/personal-trainings/user/${userId}`, { params }),
  getOne: (id) => api.get(`/personal-trainings/${id}`),
  
  // Create and manage
  create: (data) => api.post('/personal-trainings', data),
  update: (id, data) => api.put(`/personal-trainings/${id}`, data),
  delete: (id) => api.delete(`/personal-trainings/${id}`),
  
  // Status management (admin only)
  updateStatus: (id, status, comment = '') => 
    api.patch(`/personal-trainings/${id}/status`, { status, comment }),
  approve: (id, comment = '') => 
    personalTrainingsApi.updateStatus(id, 'approved', comment),
  reject: (id, comment = '') => 
    personalTrainingsApi.updateStatus(id, 'rejected', comment),
  
  // Upload proof document
  uploadProof: (id, file) => {
    const formData = new FormData();
    formData.append('proof', file);
    return api.post(`/personal-trainings/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Certificate generation (after approval)
  generateCertificate: (id) => api.post(`/personal-trainings/${id}/certificate`, {}),
};
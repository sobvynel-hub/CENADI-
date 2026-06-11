import api from './index';

/**
 * API Utilisateurs (employés)
 * CORRIGÉ : Ajout de getById comme alias de getOne
 */
export const usersApi = {
  getAll: (params) => api.get('/users', { params }),
  getOne: (id) => api.get(`/users/${id}`),
  getById: (id) => api.get(`/users/${id}`), // ✅ AJOUTÉ : alias pour compatibilité
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),

  /* Historique complet d'un employé */
  getHistory: (id) => api.get(`/users/${id}/history`),

  /* Import/Export CSV */
  importCSV: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  exportCSV: () => api.get('/users/export', { responseType: 'blob' }),
};
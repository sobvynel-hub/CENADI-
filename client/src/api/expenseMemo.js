// client/src/api/expenseMemo.js
import api from './index';
import axios from 'axios';

// Instance séparée pour les téléchargements binaires (contourne l'intercepteur qui
// retourne response.data directement – incompatible avec les blobs).
const downloadApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 60000,
});

downloadApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cenadi_token') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const expenseMemoApi = {
  // Récupérer la mémoire d'une formation
  getByFormation: (formationId) =>
    api.get(`/expense-memo/formation/${formationId}`),

  // Récupérer les sections prédéfinies
  getSections: () => api.get('/expense-memo/sections'),

  // Mettre à jour une ligne
  updateLine: (formationId, lineId, data) =>
    api.put(`/expense-memo/formation/${formationId}/lines/${lineId}`, data),

  // Réinitialiser aux valeurs par défaut
  resetToDefault: (formationId) =>
    api.post(`/expense-memo/formation/${formationId}/reset`),

  // Soumettre pour validation
  submit: (formationId) =>
    api.post(`/expense-memo/formation/${formationId}/submit`),

  // Valider (approuver / rejeter)
  validate: (formationId, status, validationComment) =>
    api.patch(`/expense-memo/formation/${formationId}/validate`, {
      status,
      validationComment,
    }),

  // ✅ Export Excel – utilise downloadApi pour recevoir le vrai ArrayBuffer/Blob
  exportExcel: (formationId) =>
    downloadApi.get(
      `/expense-memo/formation/${formationId}/export/excel`,
      { responseType: 'blob' }
    ),

  // ✅ Export PDF (HTML imprimable) – idem
  exportPDF: (formationId) =>
    downloadApi.get(
      `/expense-memo/formation/${formationId}/export/pdf`,
      { responseType: 'blob' }
    ),

  // ✅ Import Excel
  importExcel: (formationId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(
      `/expense-memo/formation/${formationId}/import/excel`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      }
    );
  },
};
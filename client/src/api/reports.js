// client/src/api/reports.js
import axios from 'axios';

// Instance dédiée aux rapports (retourne la réponse Axios brute pour les blobs HTML)
const reportApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
});

reportApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('cenadi_token') || localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const reportsApi = {
  /**
   * Génère le rapport HTML d'une formation.
   * Retourne la réponse Axios brute (response.data = Blob HTML).
   */
  getFormationReport: (formationId) =>
    reportApi.get(`/reports/formation/${formationId}`, { responseType: 'blob' }),

  /**
   * Retourne l'URL directe du rapport (pour ouverture dans un onglet).
   * Le token est passé en header via l'intercepteur.
   */
  getReportUrl: (formationId) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    return `${base}/reports/formation/${formationId}`;
  },
};
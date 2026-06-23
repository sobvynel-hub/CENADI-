/**
 * api/axios.js – Configuration Axios avec intercepteurs
 * Gère les tokens JWT, les erreurs 503 (lockdown), etc.
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cenadi_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses (notamment les erreurs 503)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Gestion de l'erreur 503 (mode lockdown)
    if (error.response?.status === 503) {
      const errorData = error.response?.data;
      const message =
        errorData?.message ||
        "L'application est actuellement en maintenance. Veuillez réessayer plus tard.";

      // Afficher une notification
      toast.error(message, {
        duration: 5000,
        position: 'top-center',
      });

      // Vérifier si l'utilisateur est sur une route publique
      const isPublicRoute =
        !window.location.pathname.includes('/admin') &&
        !window.location.pathname.includes('/dashboard') &&
        window.location.pathname !== '/login';

      // Rediriger vers une page de maintenance si nécessaire
      if (isPublicRoute && !window.location.pathname.includes('/maintenance')) {
        window.location.href = '/maintenance';
      }
    }

    // Gestion des erreurs 401 (non authentifié / session expirée)
    if (error.response?.status === 401) {
      const token = localStorage.getItem('cenadi_token');
      if (token) {
        localStorage.removeItem('cenadi_token');
        localStorage.removeItem('cenadi_user');
        localStorage.removeItem('cenadi_role');
        toast.error('Session expirée. Veuillez vous reconnecter.');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }

    // Gestion des erreurs 403 (accès interdit)
    if (error.response?.status === 403) {
      toast.error("Vous n'avez pas les droits nécessaires pour effectuer cette action.");
      if (!window.location.pathname.includes('/forbidden')) {
        window.location.href = '/forbidden';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
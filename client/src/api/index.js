import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Intercepteur pour ajouter le token (supporte les deux clés)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cenadi_token') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les réponses
api.interceptors.response.use(
  (response) => response.data, // Retourne directement les données
  (error) => {
    // Gestion des erreurs 401 (non authentifié)
    if (error.response?.status === 401) {
      localStorage.removeItem('cenadi_token');
      localStorage.removeItem('cenadi_user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    // Gestion des erreurs 403 (non autorisé)
    // ✅ CORRECTION : Ne pas rediriger pour les routes publiques comme /home
    if (error.response?.status === 403) {
      const publicRoutes = ['/home', '/formations', '/blog', '/about', '/contact'];
      const isPublicRoute = publicRoutes.some(route =>
        window.location.pathname === route || window.location.pathname.startsWith(route)
      );

      // Ne redirige que si ce n'est pas une route publique
      if (!isPublicRoute) {
        window.location.href = '/forbidden';
      }
      // Pour les routes publiques, on laisse l'erreur passer sans redirection
    }

    // Retourne l'erreur avec TOUTES les informations
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      status: error.response?.status,
      response: error.response,
      data: error.response?.data,
    });
  }
);

// ✅ AJOUT : Fonction utilitaire pour les appels sans token (routes publiques)
export const publicApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

publicApi.interceptors.response.use(
  (response) => response.data,
  (error) => {
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'Une erreur est survenue',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

export { api };
export default api;
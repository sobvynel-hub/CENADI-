import api from './index';

/**
 * Search API endpoints
 */
export const searchApi = {
  // Global search
  global: (query, params) => api.get('/search/global', { params: { q: query, ...params } }),
  
  // Specific searches
  searchFormations: (query, params) => api.get('/search/formations', { params: { q: query, ...params } }),
  searchUsers: (query, params) => api.get('/search/users', { params: { q: query, ...params } }),
  searchCertificates: (query, params) => api.get('/search/certificates', { params: { q: query, ...params } }),
  searchEnrollments: (query, params) => api.get('/search/enrollments', { params: { q: query, ...params } }),
  searchPersonalTrainings: (query, params) => api.get('/search/personal-trainings', { params: { q: query, ...params } }),
};
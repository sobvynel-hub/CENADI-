import api from './index';

export const statsApi = {
  // Dashboard overview
  getDashboard: () => api.get('/stats/dashboard'),
  getOverview: () => api.get('/stats/overview'),
  
  // Formation statistics
  getFormationStats: (params) => api.get('/stats/formations', { params }),
  getFormationDetail: (formationId) => api.get(`/stats/formations/${formationId}`),
  
  // Enrollment statistics
  getEnrollmentStats: (params) => api.get('/stats/enrollments', { params }),
  getEnrollmentsByDivision: () => api.get('/stats/enrollments/by-division'),
  getEnrollmentsByStatus: () => api.get('/stats/enrollments/by-status'),
  
  // Certificate statistics
  getCertificateStats: (params) => api.get('/stats/certificates', { params }),
  getCertificatesByFormation: () => api.get('/stats/certificates/by-formation'),
  
  // User statistics
  getUserStats: (params) => api.get('/stats/users', { params }),
  getUsersByDivision: () => api.get('/stats/users/by-division'),
  
  // Attendance statistics
  getAttendanceStats: (formationId) => api.get(`/stats/attendances/${formationId}`),
  
  // Trends
  getTrends: (period = 'month') => api.get('/stats/trends', { params: { period } }),
  getFormationTrends: (period = 'month') => api.get('/stats/formations/trends', { params: { period } }),
  getEnrollmentTrends: (period = 'month') => api.get('/stats/enrollments/trends', { params: { period } }),
};
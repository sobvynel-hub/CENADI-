import api from './index';

/**
 * Admin API endpoints
 * Super admin only
 */
export const adminApi = {
  // Admin user management
  getAdmins: (params) => api.get('/admin/admins', { params }),
  getAdmin: (id) => api.get(`/admin/admins/${id}`),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  
  // Platform settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  
  // System logs and audit
  getLogs: (params) => api.get('/admin/logs', { params }),
  getAuditTrail: (params) => api.get('/admin/audit', { params }),
  
  // System management
  getSystemHealth: () => api.get('/admin/health'),
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  
  // Backup and restore
  createBackup: () => api.post('/admin/backup', {}),
  getBackups: () => api.get('/admin/backups'),
  restoreBackup: (backupId) => api.post(`/admin/restore/${backupId}`, {}),
};

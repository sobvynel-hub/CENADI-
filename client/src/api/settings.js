// client/src/api/settings.js
import api from './axios';

export const settingsApi = {
  // Paramètres généraux
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data),
  
  // Contrôle d'accès public (lockdown)
  getPublicAccessStatus: () => api.get('/settings/public-access'),
  toggleLockdown: (message) => api.post('/settings/lockdown/toggle', { message }),
  enableLockdown: (message) => api.post('/settings/lockdown/enable', { message }),
  disableLockdown: () => api.post('/settings/lockdown/disable'),
};
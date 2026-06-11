import api from './index';

export const authApi = {
  // Authentification
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),

  // Profil utilisateur connecté
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),

  // Gestion des mots de passe
  changePassword: (oldPassword, newPassword) =>
    api.put('/auth/change-password', { oldPassword, newPassword }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) =>
    api.post(`/auth/reset-password/${token}`, { password }),

  // Token
  refreshToken: () => api.post('/auth/refresh-token'),
};
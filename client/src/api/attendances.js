import api from './index';

export const attendancesApi = {
  /* ── Lecture ── */
  getByFormation: (formationId, params) =>
    api.get(`/attendances/formation/${formationId}`, { params }),

  /* ── Marquage manuel ── */
  markPresent: (id) => api.patch(`/attendances/${id}/present`),
  markAbsent: (id) => api.patch(`/attendances/${id}/absent`),
  markLate: (id) => api.patch(`/attendances/${id}/late`),

  // ✅ AJOUTER CETTE MÉTHODE
  markAttendanceDirect: (data) => api.post('/attendances', data),

  /* ── QR Code ── */
  generateQRCode: (formationId) =>
    api.get(`/attendances/qrcode/generate/${formationId}`),

  scanQR: (data) => api.post('/attendances/scan', data),

  /* ── Statistiques de présence par formation ── */
  getStats: (formationId) => api.get(`/attendances/stats/${formationId}`),

  /* ── Marquage en masse ── */
  bulkMark: (formationId, data) =>
    api.post(`/attendances/bulk/${formationId}`, data),
};
// client/src/api/formations.js
import api from './index';

export const formationsApi = {

  // ── Routes PUBLIQUES (visiteurs) ───────────────────────────────────────────
  getUpcoming: (params) => api.get('/formations/upcoming', { params }),
  getPast:     (params) => api.get('/formations/past',     { params }),
  getPublic:   (params) => api.get('/formations/public',   { params }),
  getBySlug:   (slug)   => api.get(`/formations/slug/${slug}`),

  /**
   * GET /formations/:id — route PUBLIQUE
   * Retourne 404 si la formation est dépubliée.
   * À utiliser UNIQUEMENT sur les pages publiques (FormationDetail public, etc.)
   */
  getById: (id) => api.get(`/formations/${id}`),

  // ── Routes ADMIN (token JWT requis) ───────────────────────────────────────

  /**
   * GET /formations/:id/admin — route ADMIN
   *
   * ✅ NOUVEAU — résout le bug 404 sur FormationReport, AdminFormationDetail
   *    et ExpenseMemoPage quand la formation est dépubliée.
   *
   * Retourne la formation quelle que soit sa valeur isPublic.
   * À utiliser sur TOUTES les pages admin qui chargent une formation par ID.
   */
  getByIdAdmin: (id) => api.get(`/formations/${id}/admin`),

  getAll:  (params)     => api.get('/formations', { params }),
  create:  (data)       => api.post('/formations', data),
  update:  (id, data)   => api.patch(`/formations/${id}`, data),
  delete:  (id)         => api.delete(`/formations/${id}`),

  // ── Statut & publication ───────────────────────────────────────────────────
  updateStatus: (id, status) =>
    api.patch(`/formations/${id}/status`, { status }),

  /**
   * isPublic doit être un booléen JavaScript natif.
   * Boolean() garantit que true/false ne devient pas "true"/"false".
   */
  togglePublish: (id, isPublic) =>
    api.patch(`/formations/${id}/publish`, { isPublic: Boolean(isPublic) }),

  // ── Divers ─────────────────────────────────────────────────────────────────
  duplicate: (id) => api.post(`/formations/${id}/duplicate`, {}),
};
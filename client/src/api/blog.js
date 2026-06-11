import api from './index';

export const blogApi = {
  // Public endpoints
  getAll: (params) => api.get('/blog', { params }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  
  // Admin endpoints
  getAllAdmin: (params) => api.get('/blog/admin/all', { params }),
  getById: (id) => api.get(`/blog/admin/${id}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
  like: (id) => api.patch(`/blog/${id}/like`),
  addComment: (id, content) => api.post(`/blog/${id}/comment`, { content }),
  
  // AI Generation
  generateAuto: () => api.post('/ai-blog/generate-auto'),
  generateType: (type) => api.post(`/ai-blog/generate/${type}`),
};
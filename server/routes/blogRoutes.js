/**
 * routes/blogRoutes.js – Routes du blog
 * Base URL: /api/blog
 */

const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { uploadCoverImage } = require('../middleware/upload');
const { requirePublicAccess } = require('../middleware/publicAccess');

// ============ ROUTES PUBLIQUES ============
router.get('/', requirePublicAccess, blogController.getPublishedPosts);
router.get('/stats', requirePublicAccess, blogController.getStats);
router.get('/:slug', requirePublicAccess, blogController.getPostBySlug);

// ============ ROUTES AUTHENTIFIÉES (tous les utilisateurs connectés) ============
router.use(protect);

// ✅ Tous les utilisateurs connectés (employee, admin, super_admin) peuvent liker
router.patch('/:id/like', blogController.likePost);

// ✅ Route pour ajouter un commentaire (si vous voulez aussi l'ouvrir à tous)
router.post('/:id/comment', blogController.addComment);

// ============ ROUTES ADMIN (uniquement admins) ============
router.use(restrictTo('admin', 'super_admin'));

// Routes spécifiques admin (CRUD complet)
router.get('/admin/all', blogController.getAllPosts);
router.get('/admin/stats', blogController.getStats);
router.post('/', uploadCoverImage, blogController.createPost);
router.get('/admin/:id', blogController.getPostById);
router.put('/:id', uploadCoverImage, blogController.updatePost);
router.delete('/:id', blogController.deletePost);

module.exports = router;
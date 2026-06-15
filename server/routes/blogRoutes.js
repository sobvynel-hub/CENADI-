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

// ============ ROUTES ADMIN (protégées) ============
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Routes spécifiques admin
router.get('/admin/all', blogController.getAllPosts);
router.get('/admin/stats', blogController.getStats);
router.post('/', uploadCoverImage, blogController.createPost);

// ✅ Supprimer ou commenter la ligne qui pose problème (generateAIPost n'existe pas)
// router.post('/generate-ai', blogController.generateAIPost); // ← Supprimez cette ligne

router.get('/admin/:id', blogController.getPostById);
router.put('/:id', uploadCoverImage, blogController.updatePost);
router.delete('/:id', blogController.deletePost);
router.patch('/:id/like', blogController.likePost);
router.post('/:id/comment', blogController.addComment);

module.exports = router;

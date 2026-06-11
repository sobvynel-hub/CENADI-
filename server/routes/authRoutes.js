/**
 * routes/authRoutes.js – Routes d'authentification
 * Base URL: /api/auth
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Routes publiques
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);
router.post('/refresh-token', authController.refreshToken);

// Routes protégées (authentification requise)
router.use(protect);
router.get('/me', authController.getMe);
router.put('/me', authController.updateMe);
router.put('/change-password', authController.changePassword);
router.post('/logout', authController.logout);

module.exports = router;
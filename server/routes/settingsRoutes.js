/**
 * routes/settingsRoutes.js – Routes des paramètres généraux
 * Base URL: /api/settings
 */

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect, optionalProtect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { requirePublicAccessOrAdmin } = require('../middleware/publicAccess');

// ============ ROUTES PUBLIQUES (lecture limitée) ============
// Route pour vérifier le statut d'accès public (utilisée par le frontend)
router.get('/public-access', settingsController.getPublicAccessStatus);

// Route pour les paramètres (avec accès conditionnel selon lockdown)
router.get('/', optionalProtect, requirePublicAccessOrAdmin, settingsController.getSettings);

// ============ ROUTES DE CONTRÔLE LOCKDOWN (Super Admin uniquement) ============
router.use(protect);
router.use(restrictTo('super_admin'));

// Routes spécifiques pour le contrôle du lockdown
router.post('/lockdown/toggle', settingsController.togglePublicAccess);
router.post('/lockdown/enable', settingsController.enableLockdown);
router.post('/lockdown/disable', settingsController.disableLockdown);

// Route générique de mise à jour
router.put('/', settingsController.updateSettings);

module.exports = router;
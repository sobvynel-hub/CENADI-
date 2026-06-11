/**
 * routes/adminRoutes.js – Routes d'administration (super admin uniquement)
 * Base URL: /api/admin
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { validateAdminCreate, validateAdminUpdate } = require('../middleware/validation');

// Routes réservées au super admin
router.use(protect);
router.use(restrictTo('super_admin'));

// Gestion des admins
router
  .route('/admins')
  .get(adminController.getAllAdmins)
  .post(validateAdminCreate, adminController.createAdmin);

router
  .route('/admins/:id')
  .put(validateAdminUpdate, adminController.updateAdmin)
  .delete(adminController.deleteAdmin);

// Configuration plateforme
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// Logs
router.get('/logs', adminController.getLogs);
router.get('/logs/export', adminController.exportLogs);

// Backup
router.post('/backup', adminController.createBackup);

module.exports = router;
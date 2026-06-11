/**
 * routes/statsRoutes.js – Routes des statistiques
 * Base URL: /api/stats
 */

const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/dashboard', statsController.getDashboardStats);
router.get('/formations', statsController.getFormationStats);
router.get('/enrollments', statsController.getEnrollmentStats);
router.get('/certificates', statsController.getCertificateStats);
router.get('/divisions', statsController.getDivisionStats);
router.get('/personal', statsController.getPersonalTrainingStats);

module.exports = router;
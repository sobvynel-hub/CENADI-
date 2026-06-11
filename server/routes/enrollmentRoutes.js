/**
 * routes/enrollmentRoutes.js – Routes de gestion des inscriptions
 * Base URL: /api/enrollments
 */

const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { validateEnrollment } = require('../middleware/validation');

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router
  .route('/')
  .get(enrollmentController.getAllEnrollments)
  .post(validateEnrollment, enrollmentController.createEnrollment);

// ✅ Route pour récupérer les inscriptions par formation
router.get('/formation/:formationId', enrollmentController.getEnrollmentsByFormation);

// ✅ Route pour récupérer les inscriptions par utilisateur
router.get('/user/:userId', enrollmentController.getEnrollmentsByUser);

// ✅ Route pour mettre à jour le statut d'une inscription
router.patch('/:id/status', enrollmentController.updateEnrollmentStatus);

router.patch('/:id', enrollmentController.updateEnrollment)
// ✅ ROUTE MANQUANTE : Mettre à jour une inscription (statut, résultat, notes)
router.patch('/:id', enrollmentController.updateEnrollment);

// ✅ Route pour supprimer une inscription
router.delete('/:id', enrollmentController.deleteEnrollment);

// ✅ Route pour exporter les inscriptions d'une formation en CSV
router.get('/export/formation/:formationId', enrollmentController.exportEnrollmentsCSV);

module.exports = router;
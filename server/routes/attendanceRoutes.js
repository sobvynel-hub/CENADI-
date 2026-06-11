/**
 * routes/attendanceRoutes.js – Routes de gestion des présences
 * Base URL: /api/attendances
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Récupération des présences par formation
router.get('/formation/:formationId', attendanceController.getAttendancesByFormation);

// Marquage présence
router.post('/', attendanceController.markAttendanceDirect);

// QR Code
router.post('/scan', attendanceController.scanQRCode);
router.get('/qrcode/generate/:formationId', attendanceController.generateQRCode);

// Statistiques
router.get('/stats/:formationId', attendanceController.getAttendanceStats);

// Marquage par ID
router.patch('/:id/present', attendanceController.markPresent);
router.patch('/:id/absent', attendanceController.markAbsent);
router.patch('/:id/late', attendanceController.markLate);

module.exports = router;
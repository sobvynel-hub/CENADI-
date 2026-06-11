/**
 * routes/certificateRoutes.js – Routes de gestion des attestations
 * Base URL: /api/certificates
 */

const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificateController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/', certificateController.getAllCertificates);
router.get('/user/:userId', certificateController.getCertificatesByUser);
router.post('/generate/:enrollmentId', certificateController.generateCertificate);
router.post('/personal/:personalTrainingId', certificateController.generatePersonalCertificate);
router.post('/send/:certificateId', certificateController.sendCertificateEmail);
router.get('/download/:certificateId', certificateController.downloadCertificate);

module.exports = router;
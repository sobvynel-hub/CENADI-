/**
 * routes/index.js – Montage de tous les routeurs de l'API
 * URL de base: /api
 */

const express = require('express');
const router  = express.Router();

// Import des routeurs existants
const authRoutes            = require('./authRoutes');
const userRoutes            = require('./userRoutes');
const divisionRoutes        = require('./divisionRoutes');
const formationRoutes       = require('./formationRoutes');
const enrollmentRoutes      = require('./enrollmentRoutes');
const attendanceRoutes      = require('./attendanceRoutes');
const certificateRoutes     = require('./certificateRoutes');
const personalTrainingRoutes = require('./personalTrainingRoutes');
const searchRoutes          = require('./searchRoutes');
const statsRoutes           = require('./statsRoutes');
const adminRoutes           = require('./adminRoutes');
const settingsRoutes        = require('./settingsRoutes');
const blogRoutes            = require('./blogRoutes');
const blogSuggestionRoutes  = require('./blogSuggestionRoutes');
const aiBlogRoutes          = require('./aiBlogRoutes');
const expenseMemoRoutes     = require('./expenseMemoRoutes');

// ✅ NOUVEAU : Import des routes pour les rapports
const reportRoutes = require('./reportRoutes');

// Route de santé
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API CENADI opérationnelle',
    timestamp: new Date().toISOString(),
  });
});

// Montage des routes
router.use('/auth',             authRoutes);
router.use('/users',            userRoutes);
router.use('/divisions',        divisionRoutes);
router.use('/formations',       formationRoutes);
router.use('/enrollments',      enrollmentRoutes);
router.use('/attendances',      attendanceRoutes);
router.use('/certificates',     certificateRoutes);
router.use('/personal-trainings', personalTrainingRoutes);
router.use('/search',           searchRoutes);
router.use('/stats',            statsRoutes);
router.use('/admin',            adminRoutes);
router.use('/settings',         settingsRoutes);
router.use('/blog',             blogRoutes);
router.use('/blog-suggestions', blogSuggestionRoutes);
router.use('/ai-blog',          aiBlogRoutes);
router.use('/expense-memo',     expenseMemoRoutes);

// ✅ NOUVEAU : Montage des routes pour les rapports
router.use('/reports', reportRoutes);

// Route 404 pour les routes non définies
router.all('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} non trouvée sur l'API`,
  });
});

module.exports = router;
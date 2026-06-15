/**
 * routes/searchRoutes.js – Routes du moteur de recherche global
 * Base URL: /api/search
 */

const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { requirePublicAccess } = require('../middleware/publicAccess');

// Recherche publique (visiteur)
router.get('/formations/public', requirePublicAccess, searchController.searchPublicFormations);

// Recherches protégées (admin)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.get('/global', searchController.globalSearch);
router.get('/formations', searchController.searchFormations);
router.get('/users', searchController.searchUsers);
router.get('/certificates', searchController.searchCertificates);
router.get('/personal-trainings', searchController.searchPersonalTrainings);

module.exports = router;

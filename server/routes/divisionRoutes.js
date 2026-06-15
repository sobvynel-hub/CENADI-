/**
 * routes/divisionRoutes.js – Routes de gestion des divisions
 * Base URL: /api/divisions
 */

const express = require('express');
const router = express.Router();
const divisionController = require('../controllers/divisionController');
const { protect } = require('../middleware/auth');
const { requirePublicAccess } = require('../middleware/publicAccess');
const { restrictTo } = require('../middleware/role');  // ← IMPORTANT: vérifiez cette ligne

// Routes publiques (visiteur)
router.get('/', requirePublicAccess, divisionController.getAllDivisions);
router.get('/:id', requirePublicAccess, divisionController.getDivisionById);

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.post('/', divisionController.createDivision);
router.put('/:id', divisionController.updateDivision);
router.delete('/:id', divisionController.deleteDivision);

module.exports = router;

// server/routes/reportRoutes.js
const express        = require('express');
const router         = express.Router();
const reportController = require('../controllers/reportController');
const { protect }    = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// GET /api/reports/formation/:formationId → rapport HTML complet
router.get('/formation/:formationId', reportController.generateFormationReport);

module.exports = router;
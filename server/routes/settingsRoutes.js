const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Routes publiques (lecture)
router.get('/', settingsController.getSettings);

// Routes protégées (écriture - seulement super admin)
router.use(protect);
router.use(restrictTo('super_admin'));
router.put('/', settingsController.updateSettings);

module.exports = router;
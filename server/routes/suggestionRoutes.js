/**
 * routes/suggestionRoutes.js – Routes des suggestions
 * Base URL: /api/suggestions
 */

const express = require('express');
const router = express.Router();
const suggestionController = require('../controllers/suggestionController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

// Routes protégées (tous utilisateurs connectés)
router.use(protect);

router.post('/', suggestionController.createSuggestion);
router.patch('/:id/vote', suggestionController.voteSuggestion);

// Routes admin
router.use(restrictTo('admin', 'super_admin'));

router.get('/', suggestionController.getAllSuggestions);
router.get('/stats', suggestionController.getStats);
router.patch('/:id/status', suggestionController.updateSuggestionStatus);
router.delete('/:id', suggestionController.deleteSuggestion);

module.exports = router;
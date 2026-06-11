/**
 * routes/blogSuggestionRoutes.js – Routes pour les suggestions
 */

const express = require('express');
const router = express.Router();
const BlogSuggestionService = require('../services/blogSuggestionService');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Générer toutes les suggestions
router.post('/generate-all', async (req, res) => {
  try {
    const results = await BlogSuggestionService.generateAndPublishSuggestions();
    res.json({
      success: true,
      message: `${results.length} articles générés avec succès`,
      data: results
    });
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération',
      error: error.message
    });
  }
});

// Analyser les données existantes
router.get('/analyze', async (req, res) => {
  try {
    const suggestionsFromData = await BlogSuggestionService.analyzeExistingFormations();
    const marketTrends = await BlogSuggestionService.generateMarketTrends();
    const externalTrainings = await BlogSuggestionService.generateExternalTrainings();
    
    res.json({
      success: true,
      data: { suggestionsFromData, marketTrends, externalTrainings }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
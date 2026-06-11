const express = require('express');
const router = express.Router();
const AIBlogGeneratorService = require('../services/aiBlogGeneratorService');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');

router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router.post('/generate-auto', async (req, res) => {
  try {
    const results = await AIBlogGeneratorService.runAutoGeneration();
    res.json({ success: true, message: `${results.length} articles générés`, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
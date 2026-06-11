/**
 * routes/personalTrainingRoutes.js – Routes des déclarations personnelles
 * Base URL: /api/personal-trainings
 */

const express = require('express');
const router = express.Router();
const personalTrainingController = require('../controllers/personalTrainingController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { uploadProof } = require('../middleware/upload');

// Routes protégées (admin uniquement)
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

router
  .route('/')
  .get(personalTrainingController.getAllPersonalTrainings)
  .post(uploadProof, personalTrainingController.createPersonalTraining);

router.get('/user/:userId', personalTrainingController.getPersonalTrainingsByUser);
router.patch('/:id/status', personalTrainingController.updateStatus);
router.delete('/:id', personalTrainingController.deletePersonalTraining);
router.post('/:id/upload', uploadProof, personalTrainingController.uploadProof);

module.exports = router;
/**
 * routes/userRoutes.js – Routes de gestion des utilisateurs
 * Base URL: /api/users
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');  // ← CORRECTION ICI
const { uploadCSV } = require('../middleware/upload');

// Toutes les routes nécessitent authentification
router.use(protect);
router.use(restrictTo('admin', 'super_admin'));

// Routes CRUD principales
router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

// Routes spécifiques
router.get('/:id/history', userController.getUserHistory);
router.post('/import', uploadCSV, userController.importUsers);
router.get('/export/csv', userController.exportUsers);

module.exports = router;
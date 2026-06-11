/**
 * validations/personalTrainingValidation.js – Validation des déclarations personnelles
 */

const { body, param } = require('express-validator');

const validatePersonalTraining = [
  body('userId')
    .notEmpty().withMessage('ID utilisateur requis')
    .isMongoId().withMessage('ID utilisateur invalide'),
  body('trainingName')
    .notEmpty().withMessage('Nom de la formation requis')
    .isLength({ min: 3 }).withMessage('Nom trop court (min 3 caractères)'),
  body('provider')
    .optional()
    .isLength({ max: 100 }).withMessage('Nom de l\'organisme trop long'),
  body('startDate')
    .optional()
    .isISO8601().withMessage('Date de début invalide'),
  body('endDate')
    .optional()
    .isISO8601().withMessage('Date de fin invalide')
    .custom((endDate, { req }) => {
      if (req.body.startDate && endDate && new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    }),
  body('duration')
    .optional()
    .isInt({ min: 0 }).withMessage('La durée doit être un nombre positif'),
];

const validatePersonalTrainingStatus = [
  param('id')
    .isMongoId().withMessage('ID déclaration invalide'),
  body('status')
    .isIn(['pending', 'approved', 'rejected'])
    .withMessage('Statut invalide'),
];

module.exports = {
  validatePersonalTraining,
  validatePersonalTrainingStatus,
};
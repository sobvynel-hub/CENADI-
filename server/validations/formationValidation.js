/**
 * validations/formationValidation.js – Validation des données de formation
 */

const { body } = require('express-validator');

const validateFormation = [
  body('title')
    .notEmpty().withMessage('Titre requis')
    .isLength({ min: 3 }).withMessage('Titre trop court (min 3 caractères)'),
  body('startDate')
    .isISO8601().withMessage('Date de début invalide'),
  body('endDate')
    .isISO8601().withMessage('Date de fin invalide')
    .custom((endDate, { req }) => {
      if (new Date(endDate) < new Date(req.body.startDate)) {
        throw new Error('La date de fin doit être postérieure à la date de début');
      }
      return true;
    }),
  body('maxCapacity')
    .optional()
    .isInt({ min: 1 }).withMessage('La capacité doit être au moins 1'),
  body('location')
    .optional()
    .isLength({ max: 255 }).withMessage('Le lieu est trop long'),
  body('trainer')
    .optional()
    .isLength({ max: 100 }).withMessage('Nom du formateur trop long'),
];

const validateFormationStatus = [
  body('status')
    .isIn(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .withMessage('Statut invalide'),
];

module.exports = {
  validateFormation,
  validateFormationStatus,
};
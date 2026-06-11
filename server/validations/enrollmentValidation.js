/**
 * validations/enrollmentValidation.js – Validation des inscriptions
 */

const { body, param } = require('express-validator');

const validateEnrollment = [
  body('userId')
    .notEmpty().withMessage('ID utilisateur requis')
    .isMongoId().withMessage('ID utilisateur invalide'),
  body('formationId')
    .notEmpty().withMessage('ID formation requis')
    .isMongoId().withMessage('ID formation invalide'),
];

const validateEnrollmentStatus = [
  param('id')
    .isMongoId().withMessage('ID inscription invalide'),
  body('status')
    .isIn(['pending', 'confirmed', 'rejected', 'cancelled'])
    .withMessage('Statut invalide'),
];

module.exports = {
  validateEnrollment,
  validateEnrollmentStatus,
};
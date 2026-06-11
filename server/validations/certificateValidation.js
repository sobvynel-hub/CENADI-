/**
 * validations/certificateValidation.js – Validation des attestations
 */

const { param } = require('express-validator');

const validateCertificateId = [
  param('certificateId')
    .isMongoId().withMessage('ID attestation invalide'),
];

const validateEnrollmentId = [
  param('enrollmentId')
    .isMongoId().withMessage('ID inscription invalide'),
];

module.exports = {
  validateCertificateId,
  validateEnrollmentId,
};
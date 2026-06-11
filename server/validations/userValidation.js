/**
 * validations/userValidation.js – Validation des données utilisateur
 */

const { body, param } = require('express-validator');

const validateUserId = [
  param('id')
    .isMongoId().withMessage('ID utilisateur invalide'),
];

const validateCreateUser = [
  body('employeeId')
    .notEmpty().withMessage('Matricule requis')
    .isLength({ min: 3 }).withMessage('Matricule trop court (min 3 caractères)'),
  body('firstName')
    .notEmpty().withMessage('Prénom requis')
    .isLength({ min: 2 }).withMessage('Prénom trop court (min 2 caractères)'),
  body('lastName')
    .notEmpty().withMessage('Nom requis')
    .isLength({ min: 2 }).withMessage('Nom trop court (min 2 caractères)'),
  body('email')
    .isEmail().withMessage('Email invalide'),
  body('password')
    .optional()
    .isLength({ min: 8 }).withMessage('Mot de passe doit faire au moins 8 caractères')
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/).withMessage('Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre'),
  body('division')
    .optional()
    .isLength({ max: 100 }).withMessage('Division trop longue'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin']).withMessage('Rôle invalide'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s]{8,20}$/).withMessage('Numéro de téléphone invalide'),
  body('position')
    .optional()
    .isLength({ max: 100 }).withMessage('Poste trop long'),
];

const validateUpdateUser = [
  param('id')
    .isMongoId().withMessage('ID utilisateur invalide'),
  body('firstName')
    .optional()
    .isLength({ min: 2 }).withMessage('Prénom trop court (min 2 caractères)'),
  body('lastName')
    .optional()
    .isLength({ min: 2 }).withMessage('Nom trop court (min 2 caractères)'),
  body('email')
    .optional()
    .isEmail().withMessage('Email invalide'),
  body('division')
    .optional()
    .isLength({ max: 100 }).withMessage('Division trop longue'),
  body('role')
    .optional()
    .isIn(['admin', 'super_admin']).withMessage('Rôle invalide'),
  body('phone')
    .optional()
    .matches(/^[0-9+\-\s]{8,20}$/).withMessage('Numéro de téléphone invalide'),
  body('position')
    .optional()
    .isLength({ max: 100 }).withMessage('Poste trop long'),
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive doit être un booléen'),
];

const validateImportUsers = [
  body('file')
    .custom((_, { req }) => {
      if (!req.file) {
        throw new Error('Fichier CSV requis');
      }
      if (!req.file.mimetype.includes('csv') && !req.file.originalname.endsWith('.csv')) {
        throw new Error('Format de fichier non supporté. Utilisez CSV.');
      }
      return true;
    }),
];

module.exports = {
  validateUserId,
  validateCreateUser,
  validateUpdateUser,
  validateImportUsers,
};
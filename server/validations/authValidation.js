/**
 * validations/authValidation.js – Validation des données d'authentification
 */

const { body } = require('express-validator');

const validateRegister = [
  body('employeeId')
    .optional()
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
    .isLength({ min: 6 }).withMessage('Mot de passe doit faire au moins 6 caractères'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
];

const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Nouveau mot de passe doit faire au moins 8 caractères')
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/).withMessage('Le mot de passe doit contenir au moins 1 majuscule et 1 chiffre'),
];

module.exports = {
  validateRegister,
  validateLogin,
  validateChangePassword,
};
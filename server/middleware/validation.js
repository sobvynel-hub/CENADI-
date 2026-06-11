/**
 * middleware/validation.js – Validation des données entrantes
 */

const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');
const { ROLES } = require('../utils/constants');

const EMPLOYEE_ROLE_ALIASES = ['user', 'employee', 'employe', 'personnel', 'personnelle'];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map(err => err.msg);
    return next(new AppError(messages.join('. '), 400));
  }
  next();
};

// Validation inscription (création employé)
const validateRegister = [
  body('employeeId').optional().isLength({ min: 3 }).withMessage('Matricule trop court'),
  body('firstName').notEmpty().withMessage('Prénom requis').isLength({ min: 2 }).withMessage('Prénom trop court'),
  body('lastName').notEmpty().withMessage('Nom requis').isLength({ min: 2 }).withMessage('Nom trop court'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Mot de passe doit faire au moins 6 caractères'),
  body('division').optional(),
  body('phone').optional(),
  body('position').optional(),
  body('role').optional().isIn(EMPLOYEE_ROLE_ALIASES).withMessage('Rôle invalide'),
  validate,
];

// Validation login
const validateLogin = [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').notEmpty().withMessage('Mot de passe requis'),
  validate,
];

// Validation changement mot de passe
const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
  body('newPassword').isLength({ min: 8 }).withMessage('Nouveau mot de passe doit faire au moins 8 caractères'),
  validate,
];

// Validation création formation
const validateFormation = [
  body('title').notEmpty().withMessage('Titre requis'),
  body('startDate').isISO8601().withMessage('Date de début invalide'),
  body('endDate').isISO8601().withMessage('Date de fin invalide'),
  body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Capacité doit être ≥ 1'),
  validate,
];

// Validation inscription
const validateEnrollment = [
  body('userId').notEmpty().withMessage('ID utilisateur requis'),
  body('formationId').notEmpty().withMessage('ID formation requis'),
  validate,
];

// Validation création admin
const validateAdminCreate = [
  body('firstName').notEmpty().withMessage('Prénom requis'),
  body('lastName').notEmpty().withMessage('Nom requis'),
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 8 }).withMessage('Mot de passe doit faire au moins 8 caractères'),
  body('role').isIn([ROLES.ADMIN, ROLES.SUPER_ADMIN]).withMessage('Rôle invalide'),
  validate,
];

const validateAdminUpdate = [
  body('firstName').optional(),
  body('lastName').optional(),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('role').optional().isIn([ROLES.ADMIN, ROLES.SUPER_ADMIN]).withMessage('Rôle invalide'),
  validate,
];

const validateUserUpdate = [
  body('firstName').optional(),
  body('lastName').optional(),
  body('email').optional().isEmail().withMessage('Email invalide'),
  body('division').optional(),
  body('position').optional(),
  body('phone').optional(),
  body('isActive').optional().isBoolean().withMessage('isActive doit être un booléen'),
  validate,
];

// Validation param ID
const validateIdParam = [
  param('id').isMongoId().withMessage('ID invalide'),
  validate,
];

// Validation déclaration personnelle
const validatePersonalTraining = [
  body('trainingName').notEmpty().withMessage('Nom de la formation requis'),
  body('provider').notEmpty().withMessage('Prestataire requis'),
  body('startDate').isISO8601().withMessage('Date de début invalide'),
  body('endDate').isISO8601().withMessage('Date de fin invalide'),
  body('duration').optional().isInt({ min: 1 }).withMessage('Durée invalide'),
  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateFormation,
  validateEnrollment,
  validateAdminCreate,
  validateAdminUpdate,
  validateUserUpdate,
  validateIdParam,
  validatePersonalTraining,
};

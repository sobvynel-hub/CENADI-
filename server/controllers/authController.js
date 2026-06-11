/**
 * controllers/authController.js – Authentification et gestion des comptes
 */

const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { ROLES } = require('../utils/constants');

// Générer un token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Envoyer la réponse avec le token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  // Options du cookie
  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  // Supprimer le mot de passe de la réponse
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

/**
 * Inscription (création de compte)
 */
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, position, employeeId, division } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const duplicateFilters = [{ email }];
  if (employeeId) duplicateFilters.push({ employeeId });

  const existingUser = await User.findOne({ $or: duplicateFilters });
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email ou matricule existe déjà', 400));
  }

  // Créer l'utilisateur
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
    position: position || 'Employé',
    employeeId,
    division,
    role: ROLES.EMPLOYEE,
    isActive: true,
  });

  // Logger l'action
  await Log.create({
    userId: newUser._id,
    action: 'USER_REGISTER',
    entity: 'User',
    entityId: newUser._id,
    details: { email, employeeId },
    ip: req.ip,
  });

  // Envoyer le token
  createSendToken(newUser, 201, req, res);
});

/**
 * Connexion
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Vérifier si email et password existent
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  // Vérifier si l'utilisateur existe et si le mot de passe est correct
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  // Vérifier si le compte est actif
  if (!user.isActive) {
    return next(new AppError('Votre compte a été désactivé. Veuillez contacter un administrateur', 401));
  }

  if (!user.role || user.role === ROLES.USER) {
    user.role = ROLES.EMPLOYEE;
    await user.save({ validateBeforeSave: false });
  }

  // Logger la connexion
  await Log.create({
    userId: user._id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user._id,
    details: { email },
    ip: req.ip,
  });

  // Envoyer le token
  createSendToken(user, 200, req, res);
});

/**
 * Déconnexion
 */
exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
  });

  await Log.create({
    userId: req.user._id,
    action: 'USER_LOGOUT',
    entity: 'User',
    entityId: req.user._id,
    ip: req.ip,
  });

  res.status(200).json({ status: 'success', message: 'Déconnecté avec succès' });
});

/**
 * Rafraîchir le token
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Token de rafraîchissement requis', 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError('Utilisateur non trouvé', 401));
    }

    const newToken = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token: newToken,
    });
  } catch (error) {
    return next(new AppError('Token invalide ou expiré', 401));
  }
});

/**
 * Mot de passe oublié
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  // Générer un token de réinitialisation
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // TODO: Envoyer l'email avec le token
  // Pour l'instant, retourner le token (en développement)
  res.status(200).json({
    status: 'success',
    message: 'Token de réinitialisation généré',
    resetToken, // À enlever en production
  });
});

/**
 * Réinitialiser le mot de passe
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hasher le token reçu
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token invalide ou expiré', 400));
  }

  // Mettre à jour le mot de passe
  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Logger
  await Log.create({
    userId: user._id,
    action: 'PASSWORD_RESET',
    entity: 'User',
    entityId: user._id,
    ip: req.ip,
  });

  createSendToken(user, 200, req, res);
});

/**
 * Changer le mot de passe (utilisateur connecté)
 */
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Veuillez fournir l\'ancien et le nouveau mot de passe', 400));
  }

  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Mot de passe actuel incorrect', 401));
  }

  user.password = newPassword;
  await user.save();

  await Log.create({
    userId: user._id,
    action: 'PASSWORD_CHANGE',
    entity: 'User',
    entityId: user._id,
    ip: req.ip,
  });

  createSendToken(user, 200, req, res);
});

/**
 * Obtenir mon profil (utilisateur connecté)
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('division', 'name code');

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Mettre à jour mon profil
 */
exports.updateMe = catchAsync(async (req, res, next) => {
  // Ne pas permettre la mise à jour du mot de passe ici
  const allowedFields = ['firstName', 'lastName', 'phone', 'position'];
  const filteredBody = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      filteredBody[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  await Log.create({
    userId: user._id,
    action: 'PROFILE_UPDATE',
    entity: 'User',
    entityId: user._id,
    details: filteredBody,
    ip: req.ip,
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

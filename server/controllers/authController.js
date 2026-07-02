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
const { sendPasswordResetEmail } = require('../services/emailService');

// Générer un token JWT
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '30d',
  });
};

// Envoyer la réponse avec le token
const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

/**
 * Inscription
 */
exports.register = catchAsync(async (req, res, next) => {
  const { firstName, lastName, email, password, phone, position, employeeId, division } = req.body;

  const duplicateFilters = [{ email }];
  if (employeeId) duplicateFilters.push({ employeeId });

  const existingUser = await User.findOne({ $or: duplicateFilters });
  if (existingUser) {
    return next(new AppError('Un utilisateur avec cet email ou matricule existe déjà', 400));
  }

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

  await Log.create({
    userId: newUser._id,
    action: 'USER_REGISTER',
    entity: 'User',
    entityId: newUser._id,
    details: { email, employeeId },
    ip: req.ip,
  });

  createSendToken(newUser, 201, req, res);
});

/**
 * Connexion
 */
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Email ou mot de passe incorrect', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Votre compte a été désactivé. Veuillez contacter un administrateur', 401));
  }

  if (!user.role || user.role === ROLES.USER) {
    user.role = ROLES.EMPLOYEE;
    await user.save({ validateBeforeSave: false });
  }

  await Log.create({
    userId: user._id,
    action: 'USER_LOGIN',
    entity: 'User',
    entityId: user._id,
    details: { email },
    ip: req.ip,
  });

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
    res.status(200).json({ status: 'success', token: newToken });
  } catch (error) {
    return next(new AppError('Token invalide ou expiré', 401));
  }
});

/**
 * ✅ Mot de passe oublié (AVEC ENVOI D'EMAIL ET LOGS DE DIAGNOSTIC)
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  console.log('📩 [forgotPassword] Email reçu:', email);

  // 1. Vérifier l'utilisateur
  const user = await User.findOne({ email });
  if (!user) {
    console.log('❌ [forgotPassword] Utilisateur non trouvé');
    return next(new AppError('Aucun utilisateur trouvé avec cet email', 404));
  }

  console.log('👤 [forgotPassword] Utilisateur trouvé:', user.email);

  // 2. Générer le token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  console.log('🔑 [forgotPassword] Token brut généré:', resetToken);
  console.log('🔐 [forgotPassword] Token hashé stocké:', user.resetPasswordToken);
  console.log('⏳ [forgotPassword] Date d\'expiration:', user.resetPasswordExpires);

  // 3. Envoyer l'email
  try {
    await sendPasswordResetEmail(user.email, resetToken);
    console.log('📧 [forgotPassword] Email envoyé avec succès');
  } catch (err) {
    console.error('❌ [forgotPassword] Erreur envoi email:', err.message);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Erreur lors de l\'envoi de l\'email. Veuillez réessayer.', 500));
  }

  // 4. Réponse (le token est renvoyé uniquement en développement)
  const response = {
    status: 'success',
    message: 'Un email de réinitialisation a été envoyé à votre adresse.',
  };

  if (process.env.NODE_ENV === 'development') {
    response.resetToken = resetToken;
  }

  res.status(200).json(response);
});

/**
 * ✅ Réinitialiser le mot de passe (AVEC LOGS DE DIAGNOSTIC)
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  console.log('🔑 [resetPassword] Token reçu (URL):', token);
  console.log('📝 [resetPassword] Mot de passe reçu:', password ? '******' : 'vide');

  // Vérifier que le mot de passe est fourni
  if (!password) {
    console.log('❌ [resetPassword] Mot de passe manquant');
    return next(new AppError('Veuillez fournir un nouveau mot de passe', 400));
  }

  // Hasher le token reçu
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  console.log('🔐 [resetPassword] Hash calculé:', hashedToken);

  // Chercher l'utilisateur avec ce token et non expiré
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    console.log('❌ [resetPassword] Aucun utilisateur trouvé avec ce token ou token expiré');
    return next(new AppError('Token invalide ou expiré', 400));
  }

  console.log('👤 [resetPassword] Utilisateur trouvé:', user.email);

  // Mettre à jour le mot de passe
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save({ validateBeforeSave: true });

  console.log('✅ [resetPassword] Mot de passe mis à jour pour:', user.email);

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
 * Changer le mot de passe (connecté)
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
 * Obtenir son profil
 */
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate('division', 'name code');
  res.status(200).json({ status: 'success', data: { user } });
});

/**
 * Mettre à jour son profil
 */
exports.updateMe = catchAsync(async (req, res, next) => {
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

  res.status(200).json({ status: 'success', data: { user } });
});
/**
 * services/authService.js – Service d'authentification
 * Gère la logique métier liée à l'authentification
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendPasswordResetEmail } = require('./emailService');

/**
 * Génère un token JWT
 * @param {string} userId - ID de l'utilisateur
 * @returns {string} Token JWT
 */
const signToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Connecte un utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} password - Mot de passe
 * @returns {Promise<Object>} Utilisateur et token
 */
const loginUser = async (email, password) => {
  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }
  
  // Vérifier le mot de passe
  const isPasswordValid = await user.comparePassword(password);
  
  if (!isPasswordValid) {
    throw new AppError('Email ou mot de passe incorrect', 401);
  }
  
  // Vérifier si le compte est actif
  if (!user.isActive) {
    throw new AppError('Votre compte a été désactivé. Contactez un administrateur.', 401);
  }
  
  // Mettre à jour la dernière connexion
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });
  
  // Générer le token
  const token = signToken(user._id);
  
  // Ne pas retourner le mot de passe
  user.password = undefined;
  
  return { user, token };
};

/**
 * Récupère l'utilisateur courant
 * @param {string} userId - ID de l'utilisateur
 * @returns {Promise<Object>} Utilisateur
 */
const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404);
  }
  
  return user;
};

/**
 * Change le mot de passe
 * @param {string} userId - ID de l'utilisateur
 * @param {string} currentPassword - Mot de passe actuel
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<Object>} Token mis à jour
 */
const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  
  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404);
  }
  
  const isPasswordValid = await user.comparePassword(currentPassword);
  
  if (!isPasswordValid) {
    throw new AppError('Mot de passe actuel incorrect', 401);
  }
  
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  
  const token = signToken(user._id);
  
  return { token };
};

/**
 * Demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 * @returns {Promise<void>}
 */
const forgotPassword = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    // Ne pas révéler si l'email existe ou non pour des raisons de sécurité
    return;
  }
  
  // Générer un token de réinitialisation
  const resetToken = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: '10m' }
  );
  
  // Envoyer l'email
  await sendPasswordResetEmail(email, resetToken);
};

/**
 * Réinitialise le mot de passe
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 * @returns {Promise<Object>} Token mis à jour
 */
const resetPassword = async (token, newPassword) => {
  let decoded;
  
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError('Token invalide ou expiré', 400);
  }
  
  const user = await User.findById(decoded.id);
  
  if (!user) {
    throw new AppError("Utilisateur non trouvé", 404);
  }
  
  user.password = newPassword;
  user.passwordChangedAt = Date.now();
  await user.save();
  
  const newToken = signToken(user._id);
  
  return { token: newToken };
};

module.exports = {
  signToken,
  loginUser,
  getCurrentUser,
  changePassword,
  forgotPassword,
  resetPassword,
};
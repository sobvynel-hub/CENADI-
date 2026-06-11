/**
 * middleware/auth.js – Vérification du token JWT et extraction de l'utilisateur connecté
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { ROLES } = require('../utils/constants');

const getCookieToken = (req) => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const separatorIndex = cookie.indexOf('=');
    if (separatorIndex === -1) return acc;

    const key = cookie.slice(0, separatorIndex).trim();
    const value = cookie.slice(separatorIndex + 1).trim();
    try {
      acc[key] = decodeURIComponent(value);
    } catch (_err) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return cookies.jwt || null;
};

/**
 * Middleware de protection des routes authentifiées
 * Vérifie le token Bearer dans l'en-tête Authorization
 */
const protect = catchAsync(async (req, res, next) => {
  // 1. Récupérer le token
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    token = getCookieToken(req);
  }

  if (!token) {
    return next(new AppError('Vous devez être connecté pour accéder à cette ressource', 401));
  }

  // 2. Vérifier le token
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401));
    }
    return next(new AppError('Token invalide. Veuillez vous reconnecter.', 401));
  }

  // 3. Vérifier que l'utilisateur existe encore
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError("L'utilisateur associé à ce token n'existe plus.", 401));
  }

  // 4. Vérifier que le compte est actif
  if (!currentUser.isActive) {
    return next(new AppError('Votre compte a été désactivé. Contactez un administrateur.', 401));
  }

  // 5. Vérifier que le mot de passe n'a pas changé après l'émission du token (optionnel)
  // Cette méthode sera implémentée dans le modèle User
  if (!currentUser.role || currentUser.role === ROLES.USER) {
    currentUser.role = ROLES.EMPLOYEE;
    await currentUser.save({ validateBeforeSave: false });
  }

  if (currentUser.changedPasswordAfter && currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Mot de passe modifié récemment. Veuillez vous reconnecter.', 401));
  }

  // Attacher l'utilisateur à la requête
  req.user = currentUser;
  next();
});

module.exports = { protect };

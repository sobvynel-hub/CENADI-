/**
 * middleware/publicAccess.js – Middleware de contrôle d'accès public
 * Gère le mode lockdown : bloque l'accès public si activé
 */

const Settings = require('../models/Settings');
const { ROLES } = require('../utils/constants');

const defaultMessage = "L'espace public est temporairement indisponible. Veuillez réessayer plus tard.";

// Routes d'authentification qui doivent toujours être accessibles
// ✅ IMPORTANT : Utiliser des chemins relatifs car le middleware est monté sur '/api'
const excludedRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/refresh-token',
  '/settings/public-access',
  '/health',
];

/**
 * Réponse envoyée quand l'accès public est désactivé
 */
const publicAccessDisabledResponse = (res, publicAccess) => {
  const message = publicAccess?.message || defaultMessage;

  return res.status(503).json({
    status: 'fail',
    code: 'PUBLIC_ACCESS_DISABLED',
    message,
    data: {
      publicAccess: {
        enabled: false,
        message,
        updatedAt: publicAccess?.updatedAt || null,
      },
    },
  });
};

/**
 * Vérifie si un utilisateur est admin ou super admin
 */
const isAdminUser = (user) => {
  return user && [ROLES.ADMIN, ROLES.SUPER_ADMIN].includes(user?.role);
};

/**
 * Vérifie si une route est exclue du lockdown
 * @param {string} path - Le chemin de la requête (relatif à /api)
 */
const isExcludedRoute = (path) => {
  // Vérification exacte
  if (excludedRoutes.includes(path)) {
    return true;
  }
  // Vérification si le chemin commence par une route exclue
  return excludedRoutes.some(route => path.startsWith(route + '/'));
};

/**
 * Charge la configuration d'accès public depuis la base
 */
const loadPublicAccess = async () => {
  try {
    let settings = await Settings.findOne().select('publicAccess');

    if (!settings) {
      settings = await Settings.create({});
    }

    return settings.publicAccess;
  } catch (error) {
    console.error('Erreur loadPublicAccess:', error);
    // En cas d'erreur, on retourne un état par défaut (accès ouvert)
    return { enabled: true };
  }
};

/**
 * Middleware qui bloque complètement l'accès si le mode lockdown est activé
 * Utilisé pour les routes publiques (visiteurs non authentifiés)
 */
const requirePublicAccess = async (req, res, next) => {
  try {
    // ✅ Vérifier si la route est exclue (utiliser req.path qui est relatif à /api)
    if (isExcludedRoute(req.path)) {
      return next();
    }

    const publicAccess = await loadPublicAccess();

    // Si l'accès public est activé, on laisse passer
    if (publicAccess?.enabled === true) {
      return next();
    }

    // Mode lockdown activé - vérifier si l'utilisateur est admin
    if (isAdminUser(req.user)) {
      return next();
    }

    // Bloquer l'accès
    return publicAccessDisabledResponse(res, publicAccess);
  } catch (error) {
    console.error('Erreur requirePublicAccess:', error);
    next(error);
  }
};

/**
 * Middleware qui bloque l'accès PUBLIC mais permet aux admins de passer
 * Utilisé pour les routes qui doivent être accessibles aux admins même en lockdown
 */
const requirePublicAccessOrAdmin = async (req, res, next) => {
  try {
    const publicAccess = await loadPublicAccess();

    // Si l'accès public est activé, on laisse passer tout le monde
    if (publicAccess?.enabled === true) {
      return next();
    }

    // Mode lockdown activé : vérifier si l'utilisateur est admin
    if (isAdminUser(req.user)) {
      return next();
    }

    // Ni admin, ni accès public : bloquer
    return publicAccessDisabledResponse(res, publicAccess);
  } catch (error) {
    console.error('Erreur requirePublicAccessOrAdmin:', error);
    next(error);
  }
};

/**
 * Middleware pour vérifier le statut sans bloquer (utilisé par le frontend)
 */
const checkPublicAccessStatus = async (req, res, next) => {
  try {
    const publicAccess = await loadPublicAccess();
    req.publicAccessStatus = publicAccess;
    next();
  } catch (error) {
    req.publicAccessStatus = { enabled: true };
    next(error);
  }
};

module.exports = {
  requirePublicAccess,
  requirePublicAccessOrAdmin,
  checkPublicAccessStatus,
  isAdminUser,
  loadPublicAccess
};
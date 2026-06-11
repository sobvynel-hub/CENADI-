/**
 * middleware/role.js – Vérification des rôles utilisateur
 */

const AppError = require('../utils/AppError');

/**
 * Restreint l'accès aux utilisateurs ayant l'un des rôles spécifiés
 * @param {...string} roles – Rôles autorisés (ex: 'admin', 'super_admin')
 */
const restrictTo = (...roles) => {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError("Vous n'avez pas les permissions pour cette action.", 403)
      );
    }
    next();
  };
};

module.exports = { restrictTo };
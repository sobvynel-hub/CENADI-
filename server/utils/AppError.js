/**
 * utils/AppError.js – Classe d'erreur personnalisée pour l'application
 * Étend Error avec un statusCode HTTP et un flag isOperational
 */

class AppError extends Error {
  /**
   * @param {string} message – Message d'erreur
   * @param {number} statusCode – Code HTTP (400, 401, 403, 404, 500...)
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Erreur connue et gérée

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
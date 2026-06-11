/**
 * middleware/rateLimiter.js – Limitation du nombre de requêtes
 */

const rateLimit = require('express-rate-limit');

// Limiteur global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requêtes maximum
  message: 'Trop de requêtes depuis cette IP. Veuillez réessayer dans 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skipSuccessfulRequests: true,
  message: 'Trop de tentatives de connexion. Veuillez réessayer dans 15 minutes.',
});

// Limiteur pour les imports CSV
const importLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5,
  message: 'Limite d\'imports atteinte. Veuillez réessayer dans une heure.',
});

module.exports = {
  globalLimiter,
  authLimiter,
  importLimiter,
};
/**
 * utils/helpers.js – Fonctions utilitaires partagées dans l'application
 */

const { PAGINATION } = require('./constants');

/**
 * Génère un numéro unique d'attestation
 * Format: CERT-YYYY-XXXXXX
 */
const generateCertificateNumber = () => {
  const year = new Date().getFullYear();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CERT-${year}-${random}`;
};

/**
 * Calcule la durée d'une formation en jours
 * @param {Date} startDate
 * @param {Date} endDate
 */
const calculateDuration = (startDate, endDate) => {
  const diff = new Date(endDate) - new Date(startDate);
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Parse les paramètres de pagination depuis la requête
 * @param {object} query – req.query
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || PAGINATION.DEFAULT_PAGE);
  const limit = Math.min(
    parseInt(query.limit) || PAGINATION.DEFAULT_LIMIT,
    PAGINATION.MAX_LIMIT
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Construit la réponse paginée standardisée
 */
const paginatedResponse = (data, total, page, limit) => ({
  data,
  pagination: {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    hasNext: page * limit < total,
    hasPrev: page > 1,
  },
});

/**
 * Formate un nom complet
 */
const fullName = (firstName, lastName) =>
  `${firstName} ${lastName}`.trim();

/**
 * Génère un slug sécurisé à partir d'une chaîne
 * @param {string} text
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
};

/**
 * Valide un email
 */
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Filtre les champs d'un objet selon les clés autorisées
 * @param {object} obj
 * @param {string[]} allowedFields
 */
const filterObject = (obj, ...allowedFields) => {
  const filtered = {};
  allowedFields.forEach((field) => {
    if (obj[field] !== undefined) filtered[field] = obj[field];
  });
  return filtered;
};

module.exports = {
  generateCertificateNumber,
  calculateDuration,
  parsePagination,
  paginatedResponse,
  fullName,
  generateSlug,
  isValidEmail,
  filterObject,
};
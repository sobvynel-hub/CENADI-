/**
 * utils/constants.js – Énumérations et constantes de l'application CENADI
 */

// Rôles utilisateurs
const ROLES = {
  USER: 'user',
  EMPLOYEE: 'employee',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

const ROLE_ALIASES = {
  user: ROLES.EMPLOYEE,
  employee: ROLES.EMPLOYEE,
  employe: ROLES.EMPLOYEE,
  personnel: ROLES.EMPLOYEE,
  personnelle: ROLES.EMPLOYEE,
  admin: ROLES.ADMIN,
  super_admin: ROLES.SUPER_ADMIN,
};

const normalizeRole = (role, fallback = ROLES.EMPLOYEE) => {
  if (!role) return fallback;
  const normalized = String(role).trim().toLowerCase();
  return ROLE_ALIASES[normalized] || fallback;
};

// Statuts des formations
const FORMATION_STATUS = {
  UPCOMING: 'upcoming',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Statuts des inscriptions
const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
};

// Statuts des présences
const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
};

// Sources des attestations
const CERTIFICATE_SOURCE = {
  ENTERPRISE: 'enterprise',
  PERSONAL: 'personal',
};

// Statuts des déclarations personnelles
const PERSONAL_TRAINING_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

// Pagination par défaut
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Taille max des fichiers (en bytes)
const FILE_LIMITS = {
  IMAGE: 5 * 1024 * 1024,       // 5MB
  DOCUMENT: 10 * 1024 * 1024,   // 10MB
  PDF: 20 * 1024 * 1024,        // 20MB
};

// Types de fichiers autorisés
const ALLOWED_FILE_TYPES = {
  IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  DOCUMENTS: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
};

module.exports = {
  ROLES,
  ROLE_ALIASES,
  normalizeRole,
  FORMATION_STATUS,
  ENROLLMENT_STATUS,
  ATTENDANCE_STATUS,
  CERTIFICATE_SOURCE,
  PERSONAL_TRAINING_STATUS,
  PAGINATION,
  FILE_LIMITS,
  ALLOWED_FILE_TYPES,
};

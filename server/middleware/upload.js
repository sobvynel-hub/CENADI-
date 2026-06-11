/**
 * middleware/upload.js – Configuration Multer pour l'upload de fichiers
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/AppError');
const { FILE_LIMITS, ALLOWED_FILE_TYPES } = require('../utils/constants');

// Fonction pour s'assurer que le dossier existe
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ─── Stockage disque local ────────────────────────────────────────────────────
const diskStorage = (folder) => {
  const uploadPath = path.join(__dirname, `../uploads/${folder}`);
  ensureDirectoryExists(uploadPath);
  
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, uploadPath);
    },
    filename: (_req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const ext = path.extname(file.originalname);
      cb(null, `${folder}-${unique}${ext}`);
    },
  });
};

// S'assurer que les dossiers d'upload existent
ensureDirectoryExists(path.join(__dirname, '../uploads'));
ensureDirectoryExists(path.join(__dirname, '../uploads/proofs'));
ensureDirectoryExists(path.join(__dirname, '../uploads/certificates'));

// ─── Stockage mémoire (pour Cloudinary) ──────────────────────────────────────
const memoryStorage = multer.memoryStorage();

// ─── Filtres de fichiers ──────────────────────────────────────────────────────
const imageFilter = (_req, file, cb) => {
  if (ALLOWED_FILE_TYPES.IMAGES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Seules les images (JPEG, PNG, WebP) sont autorisées.', 400), false);
  }
};

const documentFilter = (_req, file, cb) => {
  if (ALLOWED_FILE_TYPES.DOCUMENTS.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Seuls les fichiers PDF et images sont autorisés.', 400), false);
  }
};

// ─── Instances Multer ─────────────────────────────────────────────────────────

/** Upload preuve de formation personnelle (disque local) */
const uploadProof = multer({
  storage: diskStorage('proofs'),
  fileFilter: documentFilter,
  limits: { fileSize: FILE_LIMITS.DOCUMENT },
}).single('proofFile');

/** Upload photo de profil (mémoire → Cloudinary) */
const uploadProfilePicture = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: FILE_LIMITS.IMAGE },
}).single('profilePicture');

/** Upload image de couverture formation (mémoire → Cloudinary) */
const uploadCoverImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: { fileSize: FILE_LIMITS.IMAGE },
}).single('coverImage');

/** Upload import CSV (mémoire) */
const uploadCSV = multer({
  storage: memoryStorage,
  fileFilter: (_req, file, cb) => {
    if (
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.csv')
    ) {
      cb(null, true);
    } else {
      cb(new AppError('Seuls les fichiers CSV sont autorisés.', 400), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('file');

module.exports = {
  uploadProof,
  uploadProfilePicture,
  uploadCoverImage,
  uploadCSV,
};
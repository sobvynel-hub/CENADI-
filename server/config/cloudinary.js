/**
 * config/cloudinary.js – Configuration Cloudinary pour l'upload de fichiers
 */

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload un fichier local ou buffer vers Cloudinary
 * @param {string} filePath – Chemin local ou URL
 * @param {object} options – Options Cloudinary (folder, resource_type, etc.)
 */
const uploadToCloudinary = async (filePath, options = {}) => {
  const defaultOptions = {
    folder: 'cenadi',
    resource_type: 'auto',
    ...options,
  };
  return cloudinary.uploader.upload(filePath, defaultOptions);
};

/**
 * Supprime un fichier de Cloudinary
 * @param {string} publicId – ID public du fichier
 */
const deleteFromCloudinary = async (publicId) => {
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, uploadToCloudinary, deleteFromCloudinary };
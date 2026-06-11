/**
 * config/mailer.js – Configuration Nodemailer pour l'envoi d'emails
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// Vérifier si les variables d'email sont configurées
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && 
         process.env.EMAIL_PASS && 
         process.env.EMAIL_USER !== 'your-email@gmail.com';
};

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Vérification de la connexion au démarrage (uniquement si configuré)
if (isEmailConfigured()) {
  transporter.verify((error) => {
    if (error) {
      logger.warn('⚠️ Connexion mailer échouée:', error.message);
    } else {
      logger.info('✉️ Mailer prêt');
    }
  });
} else {
  // In development, don't treat missing email config as a warning-level event.
  // Keep a notice at info level so it doesn't look like a startup error.
  if (process.env.NODE_ENV === 'production') {
    logger.warn('⚠️ Email non configuré – les emails ne seront pas envoyés');
  } else {
    logger.info('ℹ️ Email non configuré (dev) – les emails ne seront pas envoyés');
  }
}

module.exports = transporter;
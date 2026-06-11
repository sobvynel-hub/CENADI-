/**
 * server.js – Point d'entrée principal du serveur CENADI
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cenadi';

// Connexion à MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Connecté à MongoDB');
    app.listen(PORT, () => {
      logger.info(`🚀 Serveur CENADI démarré sur le port ${PORT}`);
      logger.info(`📚 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    logger.error('❌ Erreur connexion MongoDB:', err.message);
    process.exit(1);
  });

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION!', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION!', err);
  process.exit(1);
});
/**
 * server.js – Point d'entrée principal du serveur CENADI
 * Lance le serveur HTTP et connecte la base de données MongoDB
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cenadi';

// Connexion à MongoDB (si possible). En cas d'échec on loggue et démarre
// quand même le serveur pour permettre le développement local sans Mongo.
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('✅ Connecté à MongoDB');
  })
  .catch((err) => {
    logger.error('❌ Erreur connexion MongoDB (le serveur démarre quand même):', err.message || err);
  })
  .finally(() => {
    app.listen(PORT, () => {
      logger.info(`🚀 Serveur CENADI démarré sur le port ${PORT}`);
      logger.info(`📚 Mode: ${process.env.NODE_ENV || 'development'}`);
    });
  });

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! Fermeture du serveur...', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION! Fermeture du serveur...', err);
  process.exit(1);
});
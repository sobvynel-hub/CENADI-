/**
 * config/database.js – Configuration de la connexion MongoDB
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const options = {
    autoIndex: true,
  };

  let mongoServer;
  try {
    let mongoUri = process.env.MONGODB_URI;

    // If no URI provided and we're in development, start an in-memory MongoDB
    if (!mongoUri && process.env.NODE_ENV !== 'production') {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      logger.info('MongoDB in-memory démarré pour le développement');
    }

    if (!mongoUri) {
      throw new Error('MONGODB_URI non fourni et in-memory non disponible');
    }

    const conn = await mongoose.connect(mongoUri, options);
    logger.info(`MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    logger.error('Erreur connexion MongoDB:', error.message);
    if (mongoServer) {
      try {
        await mongoServer.stop();
      } catch (e) {
        logger.warn('Erreur lors de l’arrêt de MongoMemoryServer:', e.message);
      }
    }
    process.exit(1);
  }
};

// Événements de connexion
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB déconnecté');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnecté');
});

module.exports = connectDB;
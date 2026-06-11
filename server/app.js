/**
 * app.js – Configuration de l'application Express CENADI
 * Middlewares globaux, sécurité, routes
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');

const routes = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// ─── Sécurité ────────────────────────────────────────────────────────────────
app.use(helmet());

// CORS – Autoriser le front-end React
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', globalLimiter);

// ─── Parsing ─────────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitisation contre injections MongoDB
app.use(mongoSanitize());

// Protection XSS - middleware personnalisé
app.use((req, _res, next) => {
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    }
  }
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        req.query[key] = xss(req.query[key]);
      }
    }
  }
  next();
});

// Compression des réponses
app.use(compression());

// ─── Fichiers statiques ───────────────────────────────────────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Logging des requêtes ────────────────────────────────────────────────────
app.use((req, _res, next) => {
  logger.http(`${req.method} ${req.originalUrl} – IP: ${req.ip}`);
  next();
});

// ─── Routes principales ───────────────────────────────────────────────────────
app.use('/api', routes);

// Route de santé
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    app: 'CENADI Backend',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// Route 404 pour les routes non trouvées
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} non trouvée`,
  });
});

// ─── Gestion des erreurs ──────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
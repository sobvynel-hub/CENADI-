/**
 * models/Log.js – Journal d'audit des actions administrateurs
 * TTL de 90 jours sur les entrées
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  action: {
    type: String,
    required: true,
    trim: true,
  },
  entity: {
    type: String,
    trim: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * 90, // TTL: 90 jours (en secondes)
  },
});

logSchema.index({ userId: 1, createdAt: -1 });
logSchema.index({ entity: 1, entityId: 1 });
logSchema.index({ action: 1 });

const Log = mongoose.model('Log', logSchema);
module.exports = Log;
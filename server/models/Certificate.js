/**
 * models/Certificate.js – Modèle Mongoose pour les attestations de formation
 */

const mongoose = require('mongoose');
const { CERTIFICATE_SOURCE } = require('../utils/constants');

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'identifiant de l'employé est requis"],
    },
    formationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      default: null,
    },
    personalTrainingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PersonalTraining',
      default: null,
    },
    source: {
      type: String,
      enum: Object.values(CERTIFICATE_SOURCE),
      required: true,
    },
    certificateNumber: {
      type: String,
      unique: true,
      required: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    isIssued: {
      type: Boolean,
      default: false,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
      default: null,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

certificateSchema.index({ userId: 1 });
// `certificateNumber` is declared with `unique: true` on the field above,
// which already creates an index. Remove the explicit index declaration to
// avoid duplicate-index warnings from Mongoose.

const Certificate = mongoose.model('Certificate', certificateSchema);
module.exports = Certificate;
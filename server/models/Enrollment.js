/**
 * models/Enrollment.js – Modèle Mongoose pour les inscriptions aux formations
 */

const mongoose = require('mongoose');
const { ENROLLMENT_STATUS } = require('../utils/constants');

const enrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'identifiant de l'employé est requis"],
    },
    formationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
      required: [true, "L'identifiant de la formation est requis"],
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: Object.values(ENROLLMENT_STATUS),
      default: ENROLLMENT_STATUS.PENDING,
    },
    attended: {
      type: Boolean,
      default: false,
    },
    attendanceDate: {
      type: Date,
      default: null,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
    certificateIssuedDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Un employé ne peut être inscrit qu'une fois par formation
enrollmentSchema.index({ userId: 1, formationId: 1 }, { unique: true });
enrollmentSchema.index({ formationId: 1, status: 1 });
enrollmentSchema.index({ userId: 1, status: 1 });

const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
module.exports = Enrollment;
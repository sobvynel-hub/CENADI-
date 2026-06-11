/**
 * models/PersonalTraining.js – Déclarations de formations personnelles des employés
 */

const mongoose = require('mongoose');
const { PERSONAL_TRAINING_STATUS } = require('../utils/constants');

const personalTrainingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, "L'identifiant de l'employé est requis"],
    },
    trainingName: {
      type: String,
      required: [true, 'Le nom de la formation est requis'],
      trim: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
    },
    duration: {
      type: Number,
      min: [0, 'La durée ne peut pas être négative'],
    },
    description: {
      type: String,
      trim: true,
    },
    proofFile: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(PERSONAL_TRAINING_STATUS),
      default: PERSONAL_TRAINING_STATUS.PENDING,
    },
    validatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    validationDate: {
      type: Date,
      default: null,
    },
    validationComment: {
      type: String,
      trim: true,
    },
    certificateIssued: {
      type: Boolean,
      default: false,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

personalTrainingSchema.index({ userId: 1, status: 1 });
personalTrainingSchema.index({
  trainingName: 'text',
  provider: 'text',
  description: 'text',
});

const PersonalTraining = mongoose.model('PersonalTraining', personalTrainingSchema);
module.exports = PersonalTraining;
/**
 * models/Formation.js – Modèle Mongoose pour les formations CENADI
 */

const mongoose = require('mongoose');
const { FORMATION_STATUS } = require('../utils/constants');

const formationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    objectives: {
      type: String,
      trim: true,
    },
    program: {
      type: String,
    },
    prerequisites: {
      type: [String],
      default: [],
    },
    // ✅ NOUVEAU : Compétences à acquérir
    skillsToAcquire: {
      type: [String],
      default: [],
    },
    trainer: {
      type: String,
      trim: true,
    },
    trainerBio: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'La date de début est requise'],
    },
    endDate: {
      type: Date,
      required: [true, 'La date de fin est requise'],
    },
    location: {
      type: String,
      trim: true,
    },
    maxCapacity: {
      type: Number,
      min: [1, 'La capacité doit être au moins 1'],
    },
    currentEnrolled: {
      type: Number,
      default: 0,
      min: 0,
    },
    // ✅ MODIFIÉ : "budget" → "cost" (coût de la formation)
    cost: {
      type: Number,
      default: 0,
      min: [0, 'Le coût ne peut pas être négatif'],
    },
    targetDivisions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: Object.values(FORMATION_STATUS),
      default: FORMATION_STATUS.UPCOMING,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    coverImage: {
      type: String,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index
formationSchema.index({
  title: 'text',
  description: 'text',
  trainer: 'text',
  location: 'text',
});
formationSchema.index({ status: 1, startDate: 1 });

// Virtual: durée en jours
formationSchema.virtual('durationDays').get(function () {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual: places disponibles
formationSchema.virtual('availableSpots').get(function () {
  if (this.maxCapacity == null) return null;
  return Math.max(0, this.maxCapacity - this.currentEnrolled);
});

// Hook: Génération du slug avant sauvegarde
formationSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const { generateSlug } = require('../utils/helpers');
    const base = generateSlug(this.title);
    this.slug = `${base}-${Date.now()}`;
  }
  next();
});

const Formation = mongoose.model('Formation', formationSchema);
module.exports = Formation;
/**
 * models/Division.js – Modèle Mongoose pour les divisions de CENADI
 */

const mongoose = require('mongoose');

const divisionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: [true, 'Le nom de la division est requis'],
      trim: true,
    },
    code: {
      type: String,
      unique: true,
      required: [true, 'Le code de la division est requis'],
      trim: true,
      uppercase: true,
    },
    budget: {
      type: Number,
      default: 0,
      min: [0, 'Le budget ne peut pas être négatif'],
    },
    description: {
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

// Index textuel
divisionSchema.index({ name: 'text', code: 'text' });

const Division = mongoose.model('Division', divisionSchema);
module.exports = Division;
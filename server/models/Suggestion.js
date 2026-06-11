/**
 * models/Suggestion.js – Modèle pour les suggestions de formations des employés
 */

const mongoose = require('mongoose');

const suggestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'La description est requise'],
    },
    reason: {
      type: String,
      required: [true, 'La raison est requise'],
    },
    expectedBenefits: {
      type: String,
    },
    targetAudience: {
      type: String,
    },
    suggestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    suggestedByName: {
      type: String,
    },
    suggestedByDivision: {
      type: String,
    },
    category: {
      type: String,
      enum: ['technical', 'soft_skills', 'management', 'language', 'other'],
      default: 'technical',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'approved', 'rejected', 'implemented'],
      default: 'pending',
    },
    adminComment: {
      type: String,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    votes: {
      type: Number,
      default: 0,
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    tags: [{
      type: String,
    }],
    source: {
      type: String,
      enum: ['employee', 'external', 'ministere'],
      default: 'employee',
    },
  },
  {
    timestamps: true,
  }
);

// Index pour la recherche
suggestionSchema.index({ title: 'text', description: 'text', tags: 'text' });
suggestionSchema.index({ status: 1, priority: 1, createdAt: -1 });

const Suggestion = mongoose.model('Suggestion', suggestionSchema);
module.exports = Suggestion;
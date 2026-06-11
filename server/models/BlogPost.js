/**
 * models/BlogPost.js – Modèle pour les articles du blog formations
 */

const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Le titre est requis'],
      trim: true,
      minlength: [5, 'Le titre doit faire au moins 5 caractères'],
      maxlength: [200, 'Le titre ne peut pas dépasser 200 caractères'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Le résumé est requis'],
      maxlength: [300, 'Le résumé ne peut pas dépasser 300 caractères'],
    },
    content: {
      type: String,
      required: [true, 'Le contenu est requis'],
    },
    coverImage: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['upcoming', 'trending', 'feedback', 'external', 'suggestion', 'news'],
      default: 'news',
    },
    categoryLabel: {
      type: String,
      default: 'Actualité',
    },
    tags: [{
      type: String,
      trim: true,
    }],
    author: {
      type: String,
      default: 'CENADI Formation',
    },
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedFormationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Formation',
    },
    relatedSuggestionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Suggestion',
    },
    source: {
      type: String,
      enum: ['auto_generated', 'manual', 'suggestion', 'external'],
      default: 'manual',
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'draft',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    comments: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      userName: String,
      content: String,
      createdAt: { type: Date, default: Date.now },
    }],
    stats: {
      formationsCount: { type: Number, default: 0 },
      enrollmentsCount: { type: Number, default: 0 },
      satisfactionRate: { type: Number, default: 0 },
      popularityScore: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour la recherche
blogPostSchema.index({ title: 'text', content: 'text', tags: 'text' });
blogPostSchema.index({ category: 1, status: 1, publishedAt: -1 });

// Hook: Génération du slug avant sauvegarde
blogPostSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const { generateSlug } = require('../utils/helpers');
    this.slug = generateSlug(this.title);
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);
module.exports = BlogPost;
/**
 * models/User.js – Modèle Mongoose pour les employés / administrateurs CENADI
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    firstName: {
      type: String,
      required: [true, 'Le prénom est requis'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom est requis'],
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "L'email est requis"],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email invalide'],
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: undefined,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Le mot de passe doit faire au moins 6 caractères'],
      select: false,
    },
    division: {
      type: String,
      trim: true,
      default: 'Non affecté',
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.EMPLOYEE,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    position: {
      type: String,
      trim: true,
      default: 'Employé',
    },
    profilePicture: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index pour la recherche textuelle
userSchema.index({
  firstName: 'text',
  lastName: 'text',
  email: 'text',
  employeeId: 'text',
  division: 'text',
  position: 'text',
});

// Virtual: nom complet
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hook: Hash du mot de passe avant sauvegarde
userSchema.pre('save', async function (next) {
  if (!this.role || this.role === ROLES.USER) {
    this.role = ROLES.EMPLOYEE;
  }

  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  if (!this.isNew) this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Méthode: Vérification mot de passe
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Méthode: Token changé après émission JWT
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000);
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

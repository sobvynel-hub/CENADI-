/**
 * models/Attendance.js – Modèle Mongoose pour les présences aux formations
 */

const mongoose = require('mongoose');
const { ATTENDANCE_STATUS } = require('../utils/constants');

const attendanceSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: [true, 'La date est requise'],
    },
    status: {
      type: String,
      enum: Object.values(ATTENDANCE_STATUS),
      default: ATTENDANCE_STATUS.PRESENT,
    },
    qrCodeScanned: {
      type: Boolean,
      default: false,
    },
    scannedAt: {
      type: Date,
      default: null,
    },
    markedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

attendanceSchema.index({ userId: 1, formationId: 1, date: 1 });
attendanceSchema.index({ formationId: 1, date: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;
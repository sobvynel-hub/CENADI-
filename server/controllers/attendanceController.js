/**
 * controllers/attendanceController.js – Gestion des présences
 */

const mongoose = require('mongoose');
const QRCode = require('qrcode');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Formation = require('../models/Formation');
const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { ATTENDANCE_STATUS } = require('../utils/constants');

/**
 * Récupère les présences par formation
 */
exports.getAttendancesByFormation = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const { date } = req.query;
  
  const filter = { formationId };
  if (date) {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(date);
    endDate.setHours(23, 59, 59, 999);
    filter.date = { $gte: startDate, $lte: endDate };
  }
  
  const attendances = await Attendance.find(filter)
    .populate('userId', 'firstName lastName email employeeId division')
    .populate('markedBy', 'firstName lastName')
    .sort({ date: -1 });
  
  res.status(200).json({
    status: 'success',
    data: attendances,
  });
});

/**
 * Marque la présence d'un employé
 */
exports.markAttendance = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('Présence non trouvée', 404));
  }
  
  if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
    return next(new AppError('Statut invalide', 400));
  }
  
  attendance.status = status;
  attendance.markedBy = req.user._id;
  await attendance.save();
  
  // Mettre à jour le champ attended dans Enrollment
  if (status === ATTENDANCE_STATUS.PRESENT) {
    const enrollment = await Enrollment.findOne({
      userId: attendance.userId,
      formationId: attendance.formationId,
    });
    if (enrollment) {
      enrollment.attended = true;
      enrollment.attendanceDate = new Date();
      await enrollment.save();
    }
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'ATTENDANCE_MARK',
    entity: 'Attendance',
    entityId: attendance._id,
    details: { userId: attendance.userId, formationId: attendance.formationId, status },
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: attendance,
  });
});

/**
 * Marquage présence direct (POST)
 */
exports.markAttendanceDirect = catchAsync(async (req, res, next) => {
  const { userId, formationId, status, date } = req.body;
  
  // Vérifier que l'utilisateur est inscrit à la formation
  const enrollment = await Enrollment.findOne({ userId, formationId });
  if (!enrollment) {
    return next(new AppError('Cet utilisateur n\'est pas inscrit à cette formation', 400));
  }
  
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);
  
  // Vérifier si une présence existe déjà pour cette date
  let attendance = await Attendance.findOne({
    userId,
    formationId,
    date: {
      $gte: attendanceDate,
      $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000),
    },
  });
  
  if (attendance) {
    attendance.status = status || ATTENDANCE_STATUS.PRESENT;
    attendance.markedBy = req.user._id;
    await attendance.save();
  } else {
    attendance = await Attendance.create({
      userId,
      formationId,
      date: attendanceDate,
      status: status || ATTENDANCE_STATUS.PRESENT,
      markedBy: req.user._id,
    });
  }
  
  // Mettre à jour le champ attended dans Enrollment
  if (status === ATTENDANCE_STATUS.PRESENT) {
    enrollment.attended = true;
    enrollment.attendanceDate = new Date();
    await enrollment.save();
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'ATTENDANCE_MARK',
    entity: 'Attendance',
    entityId: attendance._id,
    details: { userId, formationId, status },
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: attendance,
  });
});

/**
 * Scan de QR code pour marquer présence
 */
exports.scanQRCode = catchAsync(async (req, res, next) => {
  const { formationId, userId } = req.body;
  
  if (!formationId || !userId) {
    return next(new AppError('Formation et utilisateur requis', 400));
  }
  
  const enrollment = await Enrollment.findOne({ userId, formationId });
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  const attendance = await Attendance.create({
    userId,
    formationId,
    date: new Date(),
    status: ATTENDANCE_STATUS.PRESENT,
    qrCodeScanned: true,
    scannedAt: new Date(),
    markedBy: req.user?._id || null,
  });
  
  enrollment.attended = true;
  enrollment.attendanceDate = new Date();
  await enrollment.save();
  
  res.status(200).json({
    status: 'success',
    message: 'Présence enregistrée',
    data: attendance,
  });
});

/**
 * Génère un QR code pour une formation
 */
exports.generateQRCode = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  
  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new AppError('Formation non trouvée', 404));
  }
  
  const qrData = JSON.stringify({
    formationId,
    timestamp: Date.now(),
  });
  
  const qrCodeUrl = await QRCode.toDataURL(qrData);
  
  res.status(200).json({
    status: 'success',
    data: { qrCode: qrCodeUrl, formation: formation.title },
  });
});

/**
 * Statistiques de présence par formation
 */
exports.getAttendanceStats = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  
  const totalEnrollments = await Enrollment.countDocuments({ formationId });
  const presentAttendances = await Attendance.countDocuments({
    formationId,
    status: ATTENDANCE_STATUS.PRESENT,
  });
  const absentAttendances = await Attendance.countDocuments({
    formationId,
    status: ATTENDANCE_STATUS.ABSENT,
  });
  const lateAttendances = await Attendance.countDocuments({
    formationId,
    status: ATTENDANCE_STATUS.LATE,
  });
  
  const dailyStats = await Attendance.aggregate([
    { $match: { formationId: new mongoose.Types.ObjectId(formationId) } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      totalEnrollments,
      present: presentAttendances,
      absent: absentAttendances,
      late: lateAttendances,
      participationRate: totalEnrollments > 0 ? (presentAttendances / totalEnrollments) * 100 : 0,
      dailyStats,
    },
  });
});

/**
 * Marquage présence (PATCH par ID)
 */
exports.markPresent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('Présence non trouvée', 404));
  }
  attendance.status = ATTENDANCE_STATUS.PRESENT;
  attendance.markedBy = req.user._id;
  await attendance.save();
  
  res.status(200).json({ status: 'success', data: attendance });
});

/**
 * Marquage absence (PATCH par ID)
 */
exports.markAbsent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('Présence non trouvée', 404));
  }
  attendance.status = ATTENDANCE_STATUS.ABSENT;
  attendance.markedBy = req.user._id;
  await attendance.save();
  
  res.status(200).json({ status: 'success', data: attendance });
});

/**
 * Marquage retard (PATCH par ID)
 */
exports.markLate = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const attendance = await Attendance.findById(id);
  if (!attendance) {
    return next(new AppError('Présence non trouvée', 404));
  }
  attendance.status = ATTENDANCE_STATUS.LATE;
  attendance.markedBy = req.user._id;
  await attendance.save();
  
  res.status(200).json({ status: 'success', data: attendance });
});
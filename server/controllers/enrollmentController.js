/**
 * controllers/enrollmentController.js – Gestion des inscriptions
 */

const Enrollment = require('../models/Enrollment');
const Formation = require('../models/Formation');
const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse } = require('../utils/helpers');
const csv = require('fast-csv');
const { ENROLLMENT_STATUS, FORMATION_STATUS } = require('../utils/constants');

/**
 * Récupère toutes les inscriptions (admin)
 */
exports.getAllEnrollments = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { formationId, userId, status } = req.query;
  
  const filter = {};
  if (formationId) filter.formationId = formationId;
  if (userId) filter.userId = userId;
  if (status) filter.status = status;
  
  const [enrollments, total] = await Promise.all([
    Enrollment.find(filter)
      .populate('formationId', 'title startDate location trainer')
      .populate('userId', 'firstName lastName email division employeeId phone position')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments(filter),
  ]);
  
  res.status(200).json(paginatedResponse(enrollments, total, page, limit));
});

/**
 * Récupère une inscription par ID
 */
exports.getEnrollmentById = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findById(req.params.id)
    .populate('formationId')
    .populate('userId', 'firstName lastName email division employeeId phone position');
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Crée une nouvelle inscription
 */
exports.createEnrollment = catchAsync(async (req, res, next) => {
  const { formationId, userId, status, notes } = req.body;
  
  // Vérifier si l'inscription existe déjà
  const existingEnrollment = await Enrollment.findOne({ formationId, userId });
  if (existingEnrollment) {
    return next(new AppError('Cet utilisateur est déjà inscrit à cette formation', 400));
  }
  
  // Vérifier la capacité de la formation
  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new AppError('Formation non trouvée', 404));
  }
  
  const currentEnrollments = await Enrollment.countDocuments({ formationId, status: 'confirmed' });
  if (currentEnrollments >= formation.maxCapacity) {
    return next(new AppError('La formation a atteint sa capacité maximale', 400));
  }
  
  const enrollment = await Enrollment.create({
    formationId,
    userId,
    status: status || 'pending',
    notes: notes || '',
    enrolledBy: req.user._id,
  });
  
  await Log.create({
    userId: req.user._id,
    action: 'ENROLLMENT_CREATE',
    entity: 'Enrollment',
    entityId: enrollment._id,
    details: { formationId, userId, notes },
    ip: req.ip,
  });
  
  res.status(201).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Récupère les inscriptions par formation
 */
exports.getEnrollmentsByFormation = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  const { status } = req.query;

  const filter = { formationId };
  if (status) filter.status = status;

  const enrollments = await Enrollment.find(filter)
    .populate('userId', 'firstName lastName email division position phone employeeId')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: enrollments,
  });
});

/**
 * Récupère les inscriptions par utilisateur
 */
exports.getEnrollmentsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  const enrollments = await Enrollment.find({ userId })
    .populate('formationId', 'title startDate endDate location status trainer')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    data: enrollments,
  });
});

/**
 * Met à jour le statut d'une inscription
 */
exports.updateEnrollmentStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const { id } = req.params;

  if (!Object.values(ENROLLMENT_STATUS).includes(status)) {
    return next(new AppError('Statut invalide', 400));
  }

  const enrollment = await Enrollment.findById(id);
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }

  if (enrollment.status === ENROLLMENT_STATUS.CONFIRMED && status === ENROLLMENT_STATUS.CANCELLED) {
    const formation = await Formation.findById(enrollment.formationId);
    if (formation && formation.currentEnrolled > 0) {
      formation.currentEnrolled -= 1;
      await formation.save();
    }
  }

  enrollment.status = status;
  await enrollment.save();

  await Log.create({
    userId: req.user._id,
    action: 'ENROLLMENT_STATUS_UPDATE',
    entity: 'Enrollment',
    entityId: enrollment._id,
    details: { previousStatus: enrollment.status, newStatus: status },
    ip: req.ip,
  });

  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Export des inscriptions d'une formation en CSV
 */
exports.exportEnrollmentsCSV = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;

  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new AppError('Formation non trouvée', 404));
  }

  const enrollments = await Enrollment.find({ formationId })
    .populate('userId', 'employeeId firstName lastName email division position phone');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=inscriptions_${formation.slug || formation._id}.csv`);

  const csvStream = csv.format({ headers: true });
  csvStream.pipe(res);

  for (const enrollment of enrollments) {
    csvStream.write({
      Matricule: enrollment.userId?.employeeId || '',
      Prenom: enrollment.userId?.firstName || '',
      Nom: enrollment.userId?.lastName || '',
      Email: enrollment.userId?.email || '',
      Division: enrollment.userId?.division || '',
      Poste: enrollment.userId?.position || '',
      Telephone: enrollment.userId?.phone || '',
      Statut: enrollment.status,
      DateInscription: enrollment.createdAt ? enrollment.createdAt.toLocaleDateString('fr-FR') : '',
      Presence: enrollment.attendance ? 'Présent' : 'Absent',
      Notes: enrollment.notes || '',
    });
  }

  csvStream.end();
});

/**
 * ✅ Met à jour une inscription (complet avec statut, résultat, notes)
 */
exports.updateEnrollment = catchAsync(async (req, res, next) => {
  const { status, result, notes, attendance } = req.body;
  const { id } = req.params;
  
  const updateData = {};
  if (status) updateData.status = status;
  if (result) updateData.result = result;
  if (notes !== undefined) updateData.notes = notes;
  if (attendance !== undefined) updateData.attendance = attendance;
  
  const enrollment = await Enrollment.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  );
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'ENROLLMENT_UPDATE',
    entity: 'Enrollment',
    entityId: enrollment._id,
    details: updateData,
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Supprime une inscription
 */
exports.deleteEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findByIdAndDelete(req.params.id);
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'ENROLLMENT_DELETE',
    entity: 'Enrollment',
    entityId: enrollment._id,
    ip: req.ip,
  });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Récupère les inscriptions de l'utilisateur connecté
 */
exports.getMyEnrollments = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  
  const [enrollments, total] = await Promise.all([
    Enrollment.find({ userId: req.user._id })
      .populate('formationId', 'title startDate endDate location coverImage trainer')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enrollment.countDocuments({ userId: req.user._id }),
  ]);
  
  res.status(200).json(paginatedResponse(enrollments, total, page, limit));
});

/**
 * Auto-inscription d'un utilisateur à une formation
 */
exports.selfEnroll = catchAsync(async (req, res, next) => {
  const { formationId } = req.params;
  
  // Vérifier si l'inscription existe déjà
  const existingEnrollment = await Enrollment.findOne({ formationId, userId: req.user._id });
  if (existingEnrollment) {
    return next(new AppError('Vous êtes déjà inscrit à cette formation', 400));
  }
  
  // Vérifier la capacité
  const formation = await Formation.findById(formationId);
  if (!formation) {
    return next(new AppError('Formation non trouvée', 404));
  }
  
  if (!formation.isPublic) {
    return next(new AppError('Cette formation n\'est pas accessible', 400));
  }
  
  const currentEnrollments = await Enrollment.countDocuments({ formationId, status: 'confirmed' });
  if (currentEnrollments >= formation.maxCapacity) {
    return next(new AppError('La formation a atteint sa capacité maximale', 400));
  }
  
  const enrollment = await Enrollment.create({
    formationId,
    userId: req.user._id,
    status: 'pending',
    enrolledBy: req.user._id,
  });
  
  res.status(201).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Valide une inscription (admin)
 */
exports.validateEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    { status: 'confirmed' },
    { new: true }
  );
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Annule une inscription
 */
exports.cancelEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    { status: 'cancelled' },
    { new: true }
  );
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});

/**
 * Marque la présence
 */
exports.markAttendance = catchAsync(async (req, res, next) => {
  const { attended } = req.body;
  
  const enrollment = await Enrollment.findByIdAndUpdate(
    req.params.id,
    { attendance: attended === true },
    { new: true }
  );
  
  if (!enrollment) {
    return next(new AppError('Inscription non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: enrollment,
  });
});
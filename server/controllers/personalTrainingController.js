/**
 * controllers/personalTrainingController.js – Gestion des déclarations personnelles
 */

const PersonalTraining = require('../models/PersonalTraining');
const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse } = require('../utils/helpers');
const { PERSONAL_TRAINING_STATUS } = require('../utils/constants');

/**
 * Liste toutes les déclarations personnelles
 */
exports.getAllPersonalTrainings = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { status, userId } = req.query;
  
  const filter = {};
  if (status) filter.status = status;
  if (userId) filter.userId = userId;
  
  const [trainings, total] = await Promise.all([
    PersonalTraining.find(filter)
      .populate('userId', 'firstName lastName email employeeId division')
      .populate('validatedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    PersonalTraining.countDocuments(filter),
  ]);
  
  res.status(200).json(paginatedResponse(trainings, total, page, limit));
});

/**
 * Récupère les déclarations par utilisateur
 */
exports.getPersonalTrainingsByUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  
  const trainings = await PersonalTraining.find({ userId })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    data: trainings,
  });
});

/**
 * Crée une nouvelle déclaration personnelle
 */
exports.createPersonalTraining = catchAsync(async (req, res, next) => {
  const {
    userId,
    trainingName,
    provider,
    startDate,
    endDate,
    duration,
    description,
  } = req.body;
  
  const training = await PersonalTraining.create({
    userId,
    trainingName,
    provider,
    startDate,
    endDate,
    duration,
    description,
    proofFile: req.file ? req.file.path : null,
    status: PERSONAL_TRAINING_STATUS.PENDING,
  });
  
  await Log.create({
    userId: req.user._id,
    action: 'PERSONAL_TRAINING_CREATE',
    entity: 'PersonalTraining',
    entityId: training._id,
    details: { userId, trainingName, provider },
    ip: req.ip,
  });
  
  res.status(201).json({
    status: 'success',
    data: training,
  });
});

/**
 * Met à jour le statut d'une déclaration (valider/refuser)
 */
exports.updateStatus = catchAsync(async (req, res, next) => {
  const { status, validationComment } = req.body;
  const { id } = req.params;
  
  if (!Object.values(PERSONAL_TRAINING_STATUS).includes(status)) {
    return next(new AppError('Statut invalide', 400));
  }
  
  const training = await PersonalTraining.findById(id);
  if (!training) {
    return next(new AppError('Déclaration non trouvée', 404));
  }
  
  training.status = status;
  training.validatedBy = req.user._id;
  training.validationDate = new Date();
  if (validationComment) training.validationComment = validationComment;
  await training.save();
  
  await Log.create({
    userId: req.user._id,
    action: 'PERSONAL_TRAINING_STATUS_UPDATE',
    entity: 'PersonalTraining',
    entityId: training._id,
    details: { status, comment: validationComment },
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: training,
  });
});

/**
 * Supprime une déclaration
 */
exports.deletePersonalTraining = catchAsync(async (req, res, next) => {
  const training = await PersonalTraining.findByIdAndDelete(req.params.id);
  
  if (!training) {
    return next(new AppError('Déclaration non trouvée', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'PERSONAL_TRAINING_DELETE',
    entity: 'PersonalTraining',
    entityId: training._id,
    ip: req.ip,
  });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Upload d'une preuve pour une déclaration
 */
exports.uploadProof = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  if (!req.file) {
    return next(new AppError('Fichier requis', 400));
  }
  
  const training = await PersonalTraining.findById(id);
  if (!training) {
    return next(new AppError('Déclaration non trouvée', 404));
  }
  
  training.proofFile = req.file.path;
  await training.save();
  
  res.status(200).json({
    status: 'success',
    data: training,
  });
});
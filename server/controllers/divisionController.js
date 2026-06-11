/**
 * controllers/divisionController.js – Gestion des divisions
 */

const Division = require('../models/Division');
const User = require('../models/User');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse, filterObject } = require('../utils/helpers');

/**
 * Liste toutes les divisions (public)
 */
exports.getAllDivisions = catchAsync(async (req, res, next) => {
  const divisions = await Division.find().sort({ name: 1 });
  
  res.status(200).json({
    status: 'success',
    data: divisions,
  });
});

/**
 * Récupère une division par son ID (public)
 */
exports.getDivisionById = catchAsync(async (req, res, next) => {
  const division = await Division.findById(req.params.id);
  
  if (!division) {
    return next(new AppError('Division non trouvée', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: division,
  });
});

/**
 * Crée une nouvelle division (admin uniquement)
 */
exports.createDivision = catchAsync(async (req, res, next) => {
  const { name, code, budget, description } = req.body;
  
  // Vérifier si la division existe déjà
  const existingDivision = await Division.findOne({ $or: [{ name }, { code }] });
  if (existingDivision) {
    return next(new AppError('Une division avec ce nom ou ce code existe déjà', 400));
  }
  
  const division = await Division.create({
    name,
    code: code.toUpperCase(),
    budget: budget || 0,
    description,
  });
  
  await Log.create({
    userId: req.user._id,
    action: 'DIVISION_CREATE',
    entity: 'Division',
    entityId: division._id,
    details: { name, code, budget },
    ip: req.ip,
  });
  
  res.status(201).json({
    status: 'success',
    data: division,
  });
});

/**
 * Met à jour une division (admin uniquement)
 */
exports.updateDivision = catchAsync(async (req, res, next) => {
  const allowedFields = ['name', 'code', 'budget', 'description'];
  const filteredBody = filterObject(req.body, ...allowedFields);
  
  const division = await Division.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  
  if (!division) {
    return next(new AppError('Division non trouvée', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'DIVISION_UPDATE',
    entity: 'Division',
    entityId: division._id,
    details: filteredBody,
    ip: req.ip,
  });
  
  res.status(200).json({
    status: 'success',
    data: division,
  });
});

/**
 * Supprime une division (admin uniquement)
 */
exports.deleteDivision = catchAsync(async (req, res, next) => {
  // Vérifier si des employés sont rattachés à cette division
  const usersCount = await User.countDocuments({ division: req.params.id });
  if (usersCount > 0) {
    return next(new AppError(`Impossible de supprimer: ${usersCount} employés sont rattachés à cette division`, 400));
  }
  
  const division = await Division.findByIdAndDelete(req.params.id);
  
  if (!division) {
    return next(new AppError('Division non trouvée', 404));
  }
  
  await Log.create({
    userId: req.user._id,
    action: 'DIVISION_DELETE',
    entity: 'Division',
    entityId: division._id,
    details: { name: division.name, code: division.code },
    ip: req.ip,
  });
  
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
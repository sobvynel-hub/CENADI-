/**
 * controllers/userController.js – Gestion des utilisateurs (admin)
 */

const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Certificate = require('../models/Certificate');
const PersonalTraining = require('../models/PersonalTraining');
const Log = require('../models/Log');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { parsePagination, paginatedResponse, filterObject } = require('../utils/helpers');
const { PAGINATION, normalizeRole } = require('../utils/constants');
const csv = require('fast-csv');
const { Readable } = require('stream');

/**
 * Liste tous les utilisateurs (avec pagination, filtres, recherche)
 */
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = parsePagination(req.query);
  const { search, division, role, isActive } = req.query;

  // Construction du filtre
  const filter = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { employeeId: { $regex: search, $options: 'i' } },
    ];
  }
  if (division) filter.division = division;
  if (role) filter.role = normalizeRole(role, role);
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json(paginatedResponse(users, total, page, limit));
});

/**
 * Récupère un utilisateur par son ID
 */
exports.getUserById = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Crée un nouvel utilisateur
 */
exports.createUser = catchAsync(async (req, res, next) => {
  const { employeeId, firstName, lastName, email, password, division, role, phone, position } = req.body;

  const duplicateFilters = [{ email }];
  if (employeeId) duplicateFilters.push({ employeeId });

  const existingUser = await User.findOne({ $or: duplicateFilters });
  if (existingUser) {
    return next(new AppError('Email ou matricule déjà utilisé', 400));
  }

  const newUser = await User.create({
    employeeId,
    firstName,
    lastName,
    email,
    password,
    division,
    role: role ? normalizeRole(role, role) : undefined,
    phone,
    position,
  });

  await Log.create({
    userId: req.user._id,
    action: 'USER_CREATE',
    entity: 'User',
    entityId: newUser._id,
    details: { employeeId, email },
    ip: req.ip,
  });

  res.status(201).json({
    status: 'success',
    data: { user: newUser },
  });
});

/**
 * Met à jour un utilisateur
 */
exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.role) req.body.role = normalizeRole(req.body.role, req.body.role);

  const allowedFields = ['firstName', 'lastName', 'email', 'division', 'role', 'phone', 'position', 'isActive'];
  const filteredBody = filterObject(req.body, ...allowedFields);

  const user = await User.findByIdAndUpdate(req.params.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  await Log.create({
    userId: req.user._id,
    action: 'USER_UPDATE',
    entity: 'User',
    entityId: user._id,
    details: filteredBody,
    ip: req.ip,
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

/**
 * Supprime un utilisateur
 */
exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('Utilisateur non trouvé', 404));
  }

  await Log.create({
    userId: req.user._id,
    action: 'USER_DELETE',
    entity: 'User',
    entityId: user._id,
    details: { employeeId: user.employeeId, email: user.email },
    ip: req.ip,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

/**
 * Récupère l'historique complet d'un utilisateur (formations, attestations, déclarations)
 */
exports.getUserHistory = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const [enrollments, certificates, personalTrainings] = await Promise.all([
    Enrollment.find({ userId }).populate('formationId', 'title startDate endDate status'),
    Certificate.find({ userId }).populate('formationId', 'title'),
    PersonalTraining.find({ userId }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      enrollments,
      certificates,
      personalTrainings,
      stats: {
        totalEnrollments: enrollments.length,
        completedEnrollments: enrollments.filter(e => e.attended).length,
        certificatesIssued: certificates.length,
        personalTrainings: personalTrainings.length,
      },
    },
  });
});

/**
 * Import d'utilisateurs depuis CSV
 */
exports.importUsers = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Fichier CSV requis', 400));
  }

  const results = [];
  const errors = [];

  const bufferStream = new Readable();
  bufferStream.push(req.file.buffer);
  bufferStream.push(null);

  csv.parseStream(bufferStream, { headers: true, trim: true })
    .on('data', (row) => results.push(row))
    .on('end', async () => {
      for (const row of results) {
        try {
          const duplicateFilters = [{ email: row.email }];
          if (row.employeeId) duplicateFilters.push({ employeeId: row.employeeId });

          const existingUser = await User.findOne({ $or: duplicateFilters });
          if (existingUser) {
            errors.push({ row, error: 'Email ou matricule déjà existant' });
            continue;
          }

          await User.create({
            employeeId: row.employeeId,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            password: 'Temp123456!',
            division: row.division,
            position: row.position,
            phone: row.phone,
            role: row.role ? normalizeRole(row.role, row.role) : undefined,
          });
        } catch (err) {
          errors.push({ row, error: err.message });
        }
      }

      await Log.create({
        userId: req.user._id,
        action: 'USERS_IMPORT',
        entity: 'User',
        details: { total: results.length, success: results.length - errors.length, errors: errors.length },
        ip: req.ip,
      });

      res.status(200).json({
        status: 'success',
        message: `${results.length - errors.length} utilisateurs importés`,
        errors: errors.length > 0 ? errors : undefined,
      });
    });
});

/**
 * Export des utilisateurs en CSV
 */
exports.exportUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({}).lean();

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=users.csv');

  csv.writeToStream(res, users, {
    headers: ['employeeId', 'firstName', 'lastName', 'email', 'division', 'position', 'phone', 'role', 'isActive', 'createdAt'],
    transform: (row) => ({
      employeeId: row.employeeId,
      firstName: row.firstName,
      lastName: row.lastName,
      email: row.email,
      division: row.division || '',
      position: row.position || '',
      phone: row.phone || '',
      role: row.role || '',
      isActive: row.isActive,
      createdAt: row.createdAt,
    }),
  });
});
